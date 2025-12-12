import { ProductDTO, ProductOptionDTO, ProductVariantDTO } from "@medusajs/framework/types";
import { EntryProps, PlainClientAPI } from "contentful-management";
import { ModuleOptions } from "./loader/create-content-models";
import { MedusaError } from "@medusajs/framework/utils";
import { CanonicalRequest, verifyRequest } from "@contentful/node-apps-toolkit";

type InjectedDependencies = {
  contentfulManagementClient: PlainClientAPI;
  contentfulDeliveryClient: any;
}

export default class ContentfulModuleService {
  private managementClient: PlainClientAPI;
  private deliveryClient: any;
  private options: ModuleOptions;

  constructor(
    { contentfulManagementClient, contentfulDeliveryClient }: InjectedDependencies, 
    options: ModuleOptions
  ) {
    this.managementClient = contentfulManagementClient;
    this.deliveryClient = contentfulDeliveryClient;
    this.options = {
      ...options,
      default_locale: options.default_locale || "en-US",
    }
  }

  async list(
    filter: {
      id: string | string[]
      context?: {
        locale: string
      }
    }
  ) {
    const contentfulProducts = await this.deliveryClient.getEntries({
      limit: 15,
      content_type: "product",
      "fields.medusaId": filter.id,
      locale: filter.context?.locale,
      include: 3
    })

    return contentfulProducts.items.map((product) => {
      // remove links
      const { productVariants: _, productOptions: __, ...productFields } = product.fields
      return {
        ...productFields,
        product_id: product.fields.medusaId,
        variants: product.fields.productVariants.map((variant) => {
          // remove circular reference
          const { product: _, productOptionValues: __, ...variantFields } = variant.fields
          return {
            ...variantFields,
            product_variant_id: variant.fields.medusaId,
            options: variant.fields.productOptionValues.map((option) => {
              // remove circular reference
              const { productOption: _, ...optionFields } = option.fields
              return {
                ...optionFields,
                product_option_id: option.fields.medusaId,
              }
            })
          }
        }),
        options: product.fields.productOptions.map((option) => {
          // remove circular reference
          const { product: _, ...optionFields } = option.fields
          return {
            ...optionFields,
            product_option_id: option.fields.medusaId,
            values: option.fields.values.map((value) => {
              // remove circular reference
              const { productOptionValue: _, ...valueFields } = value.fields
              return {
                ...valueFields,
                product_option_value_id: value.fields.medusaId,
              }
            })
          }
        })
      }
    })
  }

  async verifyWebhook(request: CanonicalRequest) {
    if (!this.options.webhook_secret) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Webhook secret is not set")
    }
    return verifyRequest(this.options.webhook_secret, request, 0)
  }

  async getLocales() {
    return await this.managementClient.locale.getMany({});
  }

  async getDefaultLocaleCode() {
    return this.options.default_locale
  }

  async getOptionMedusaIds(optionEntryIds: string[]): Promise<string[]> {
    const medusaIds: string[] = []
    
    for (const entryId of optionEntryIds) {
      try {
        const optionEntry = await this.managementClient.entry.get({
          environmentId: this.options.environment,
          entryId,
        })
        
        const medusaId = optionEntry.fields.medusaId?.[this.options.default_locale!]
        if (medusaId) {
          medusaIds.push(medusaId)
        }
      } catch (error) {
        // Option entry might not exist, skip it
        continue
      }
    }
    
    return medusaIds
  }

  async createProduct(
    product: ProductDTO
  ) {
    try {
      // check if product already exists
      const productEntry = await this.managementClient.entry.get({
        environmentId: this.options.environment,
        entryId: product.id,
      })
      
      return productEntry
    } catch(e) {}
    
    // Create product entry in Contentful
    const productEntry = await this.managementClient.entry.createWithId(
      {
        contentTypeId: "product",
        entryId: product.id,
      },
      {
        fields: {
          medusaId: {
            [this.options.default_locale!]: product.id
          },
          title: {
            [this.options.default_locale!]: product.title
          },
          description: product.description ? {
            [this.options.default_locale!]: {
              nodeType: "document",
              data: {},
              content: [
                {
                  nodeType: "paragraph",
                  data: {},
                  content: [
                    {
                      nodeType: "text",
                      value: product.description,
                      marks: [],
                      data: {}
                    }
                  ]
                }
              ]
            }
          } : undefined,
          subtitle: product.subtitle ? {
            [this.options.default_locale!]: product.subtitle
          } : undefined,
          handle: product.handle ? {
            [this.options.default_locale!]: product.handle
          } : undefined,
        }
      }
    )

    // Reference existing options (options are now global and created separately)
    // We just link to them if they exist
    const optionLinks: {
      sys: {
        type: "Link",
        linkType: "Entry",
        id: string
      }
    }[] = []
    
    if (product.options?.length) {
      for (const option of product.options) {
        try {
          // Check if option exists in Contentful
          await this.managementClient.entry.get({
            environmentId: this.options.environment,
            entryId: option.id,
          })
          optionLinks.push({
            sys: {
              type: "Link",
              linkType: "Entry",
              id: option.id
            }
          })
        } catch (e) {
          // Option doesn't exist yet, skip it (should be created separately)
        }
      }
    }

    // Create variants if they exist
    if (product.variants?.length) {
      await this.createProductVariant(product.variants, productEntry)
    }

    // update product entry with variants and options
    await this.managementClient.entry.update(
      {
        entryId: productEntry.sys.id,
      },
      {
        sys: productEntry.sys,
        fields: {
          ...productEntry.fields,
          productVariants: {
            [this.options.default_locale!]: product.variants?.map(variant => ({
              sys: {
                type: "Link",
                linkType: "Entry",
                id: variant.id
              }
            }))
          },
          productOptions: {
            [this.options.default_locale!]: optionLinks
          }
        }
      }
    )

    return productEntry
  }

  async deleteProduct(productId: string) {
    try {
      // Get the product entry
      const productEntry = await this.managementClient.entry.get({
        environmentId: this.options.environment,
        entryId: productId,
      })

      if (!productEntry) {
        return
      }

      // Delete the product entry
      await this.managementClient.entry.unpublish({
        environmentId: this.options.environment,
        entryId: productId,
      })

      await this.managementClient.entry.delete({
        environmentId: this.options.environment,
        entryId: productId,
      })

      // Delete the product variant entries
      for (const variant of productEntry.fields.productVariants[this.options.default_locale!]) {
        await this.managementClient.entry.unpublish({
          environmentId: this.options.environment,
          entryId: variant.sys.id,
        })

        await this.managementClient.entry.delete({
          environmentId: this.options.environment,
          entryId: variant.sys.id,
        })
      }

      // Note: Product options are now global and should not be deleted when deleting a product
      // They may be used by other products
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Failed to delete product from Contentful: ${error.message}`
      )
    }
  }

  async deleteProductOption(optionId: string) {
    try {
      // Get the option entry
      const optionEntry = await this.managementClient.entry.get({
        environmentId: this.options.environment,
        entryId: optionId,
      })

      if (!optionEntry) {
        return
      }

      // Delete option values first
      const values = optionEntry.fields.values?.[this.options.default_locale!] || []
      for (const value of values) {
        try {
          await this.managementClient.entry.unpublish({
            environmentId: this.options.environment,
            entryId: value.sys.id,
          })

          await this.managementClient.entry.delete({
            environmentId: this.options.environment,
            entryId: value.sys.id,
          })
        } catch (error) {
          // Value might not exist or already deleted, continue
        }
      }

      // Delete the option entry
      await this.managementClient.entry.unpublish({
        environmentId: this.options.environment,
        entryId: optionId,
      })

      await this.managementClient.entry.delete({
        environmentId: this.options.environment,
        entryId: optionId,
      })
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Failed to delete product option from Contentful: ${error.message}`
      )
    }
  }

  async createOrUpdateProductOption(option: ProductOptionDTO): Promise<EntryProps> {
    // Check if option already exists
    let optionEntry: EntryProps
    try {
      optionEntry = await this.managementClient.entry.get({
        environmentId: this.options.environment,
        entryId: option.id,
      })
      
      // Update existing option
      const valueIds: {
        sys: {
          type: "Link",
          linkType: "Entry",
          id: string
        }
      }[] = []
      
      for (const value of option.values) {
        // Create or get value entry
        let valueEntry: EntryProps
        try {
          valueEntry = await this.managementClient.entry.get({
            environmentId: this.options.environment,
            entryId: value.id,
          })
          
          // Update existing value
          await this.managementClient.entry.update(
            {
              entryId: value.id,
            },
            {
              sys: valueEntry.sys,
              fields: {
                ...valueEntry.fields,
                value: {
                  [this.options.default_locale!]: value.value
                },
                medusaId: {
                  [this.options.default_locale!]: value.id
                },
              }
            }
          )
        } catch (e) {
          // Create new value
          await this.managementClient.entry.createWithId(
            {
              contentTypeId: "productOptionValue",
              entryId: value.id,
            },
            {
              fields: {
                value: {
                  [this.options.default_locale!]: value.value
                },
                medusaId: {
                  [this.options.default_locale!]: value.id
                },
              }
            }
          )
        }
        
        valueIds.push({
          sys: {
            type: "Link",
            linkType: "Entry",
            id: value.id
          }
        })
      }
      
      // Update option entry (without product link since it's global)
      await this.managementClient.entry.update(
        {
          entryId: option.id,
        },
        {
          sys: optionEntry.sys,
          fields: {
            ...optionEntry.fields,
            medusaId: {
              [this.options.default_locale!]: option.id
            },
            title: {
              [this.options.default_locale!]: option.title
            },
            values: {
              [this.options.default_locale!]: valueIds
            }
          }
        }
      )
      
      return optionEntry
    } catch (e) {
      // Create new option
      const valueIds: {
        sys: {
          type: "Link",
          linkType: "Entry",
          id: string
        }
      }[] = []
      
      for (const value of option.values) {
        // Create value entry
        await this.managementClient.entry.createWithId(
          {
            contentTypeId: "productOptionValue",
            entryId: value.id,
          },
          {
            fields: {
              value: {
                [this.options.default_locale!]: value.value
              },
              medusaId: {
                [this.options.default_locale!]: value.id
              },
            }
          }
        )
        
        valueIds.push({
          sys: {
            type: "Link",
            linkType: "Entry",
            id: value.id
          }
        })
      }
      
      // Create option entry (without product link since it's global)
      optionEntry = await this.managementClient.entry.createWithId(
        {
          contentTypeId: "productOption",
          entryId: option.id,
        },
        {
          fields: {
            medusaId: {
              [this.options.default_locale!]: option.id
            },
            title: {
              [this.options.default_locale!]: option.title
            },
            values: {
              [this.options.default_locale!]: valueIds
            }
          }
        }
      )
      
      return optionEntry
    }
  }

  private async createProductVariant(
    variants: ProductVariantDTO[],
    productEntry: EntryProps
  ) {
    for (const variant of variants) {
      await this.managementClient.entry.createWithId(
        {
          contentTypeId: "productVariant",
          entryId: variant.id,
        },
        {
          fields: {
            medusaId: {
              [this.options.default_locale!]: variant.id
            },
            title: {
              [this.options.default_locale!]: variant.title
            },
            product: {
              [this.options.default_locale!]: {
                sys: {
                  type: "Link",
                  linkType: "Entry",
                  id: productEntry.sys.id
                }
              }
            },
            productOptionValues: {
              [this.options.default_locale!]: variant.options.map(option => ({
                sys: {
                  type: "Link",
                  linkType: "Entry",
                  id: option.id
                }
              }))
            }
          }
        }
      )
    }
  }
}