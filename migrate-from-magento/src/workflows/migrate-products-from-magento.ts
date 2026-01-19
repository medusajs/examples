import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { CreateProductWorkflowInputDTO, CreateProductOptionDTO, UpsertProductDTO } from "@medusajs/framework/types"
import { createProductsWorkflow, createProductOptionsWorkflow, updateProductsWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { getMagentoProductsStep } from "./steps/get-magento-products"
import { MagentoAttribute } from "../modules/magento/types"

type MigrateProductsFromMagentoWorkflowInput = {
  currentPage: number
  pageSize: number
}

export const migrateProductsFromMagentoWorkflowId = "migrate-products-from-magento"

export const migrateProductsFromMagentoWorkflow = createWorkflow(
  {
    name: migrateProductsFromMagentoWorkflowId,
    retentionTime: 10000,
    store: true
  },
  (input: MigrateProductsFromMagentoWorkflowInput) => {
    const { pagination, products, attributes } = getMagentoProductsStep(
      input
    )
    const { data: stores } = useQueryGraphStep({
      entity: "store",
      fields: ["supported_currencies.*", "default_sales_channel_id"],
      pagination: {
        take: 1,
        skip: 0
      }
    })

    const { data: shippingProfiles } = useQueryGraphStep({
      entity: "shipping_profile",
      fields: ["id"],
      pagination: {
        take: 1,
        skip: 0
      }
    }).config({ name: "get-shipping-profiles" })

    const categoryExternalIds = transform({
      products,
      attributes
    }, (data) => {
      const ids: string[] = []
      data.products.map((product) => {
        if (!product.extension_attributes.category_links.length) {
          return
        }

        ids.push(...product.extension_attributes.category_links.map((link) => link.category_id))
      })
      return ids
    })

    const { data: categories } = useQueryGraphStep({
      entity: "product_category",
      fields: ["id", "metadata"],
      filters: {
        metadata: {
          external_id: categoryExternalIds
        }
      }
    }).config({ name: "get-categories" })

    const externalIdFilters = transform({
      products
    }, (data) => {
      return data.products.map((product) => product.id.toString())
    })

    const { data: existingProducts } = useQueryGraphStep({
      entity: "product",
      fields: ["id", "external_id", "variants.id", "variants.metadata"],
      filters: {
        external_id: externalIdFilters
      }
    }).config({ name: "get-existing-products" })

    const attributeExternalIds = transform({
      attributes
    }, (data) => {
      return data.attributes.map((attr) => attr.attribute_id.toString())
    })

    const { data: existingOptions } = useQueryGraphStep({
      entity: "product_option",
      fields: ["id", "title", "metadata", "values.id", "values.value"],
      filters: {
        metadata: {
          external_id: attributeExternalIds
        }
      }
    }).config({ name: "get-existing-options" })

    const { optionsToCreate } = transform({
      attributes,
      existingOptions
    }, (data) => {
      const optionsToCreate = new Map<string, CreateProductOptionDTO & { metadata?: Record<string, unknown> }>()

      data.attributes.forEach((attr: MagentoAttribute) => {
        const existingOption = data.existingOptions.find(
          (option) => option.metadata?.external_id === attr.attribute_id.toString()
        )

        // If option already exists, skip it
        if (existingOption) {
          return
        }

        const optionData: CreateProductOptionDTO & { metadata?: Record<string, unknown> } = {
          title: attr.default_frontend_label,
          values: attr.options.map((opt) => opt.label),
          metadata: {
            external_id: attr.attribute_id.toString()
          }
        }

        optionsToCreate.set(attr.attribute_id.toString(), optionData)
      })

      return {
        optionsToCreate: Array.from(optionsToCreate.values())
      }
    })

    // Create missing options if any
    const newOptions = createProductOptionsWorkflow.runAsStep({
      input: {
        product_options: optionsToCreate
      }
    })

    // Merge existing and newly created options
    const allOptions = transform({
      existingOptions,
      newOptions
    }, (data) => {
      return [...(data.existingOptions || []), ...(data.newOptions || [])]
    })

    const { 
      productsToCreate,
      productsToUpdate
    } = transform({
      products,
      attributes,
      stores,
      categories,
      shippingProfiles,
      existingProducts,
      allOptions
    }, (data) => {
      const productsToCreate = new Map<string, CreateProductWorkflowInputDTO>()
      const productsToUpdate = new Map<string, UpsertProductDTO>()

      data.products.forEach((magentoProduct) => {
        const productData: CreateProductWorkflowInputDTO | UpsertProductDTO = {
          title: magentoProduct.name,
          description: magentoProduct.custom_attributes.find((attr) => attr.attribute_code === "description")?.value,
          status: magentoProduct.status === 1 ? "published" : "draft",
          handle: magentoProduct.custom_attributes.find((attr) => attr.attribute_code === "url_key")?.value,
          external_id: magentoProduct.id.toString(),
          thumbnail: magentoProduct.media_gallery_entries.find((entry) => entry.types.includes("thumbnail"))?.file,
          sales_channels: [{
            id: data.stores[0].default_sales_channel_id
          }],
          shipping_profile_id: data.shippingProfiles[0].id,
        }
        const existingProduct = data.existingProducts.find((p) => p.external_id === productData.external_id)

        if (existingProduct) {
          productData.id = existingProduct.id
        }

        productData.category_ids = magentoProduct.extension_attributes.category_links.map((link) => {
          const category = data.categories.find((cat) => cat.metadata.external_id === link.category_id)
          return category?.id
        }).filter(Boolean)

        productData.options = magentoProduct.extension_attributes.configurable_product_options
          ?.map((option) => {
            const attribute = data.attributes.find((attr) => attr.attribute_id === parseInt(option.attribute_id))
            const existingOption = data.allOptions.find(
              (opt) => opt.metadata?.external_id === option.attribute_id
            )

            if (!existingOption || !attribute) {
              return null
            }

            // Map option values to their IDs
            const valueIds = option.values
              .map((v) => {
                const attributeOption = attribute.options.find((opt) => parseInt(opt.value) === v.value_index)
                if (!attributeOption) {
                  return null
                }

                const optionValue = existingOption.values.find(
                  (val) => val.value === attributeOption.label
                )
                return optionValue?.id
              })
              .filter((id): id is string => Boolean(id))

            return {
              id: existingOption.id,
              value_ids: valueIds
            }
          })
          .filter((opt): opt is { id: string; value_ids: string[] } => opt !== null) || []

        productData.variants = magentoProduct.children?.map((child) => {
          const childOptions: Record<string, string> = {}

          child.custom_attributes.forEach((attr) => {
            const attrData = data.attributes.find((a) => a.attribute_code === attr.attribute_code)
            if (!attrData) {
              return
            }

            childOptions[attrData.default_frontend_label] = attrData.options.find((opt) => opt.value === attr.value)?.label || ""
          })

          const variantExternalId = child.id.toString()
          const existingVariant = existingProduct?.variants.find((v) => v.metadata.external_id === variantExternalId)

          return {
            title: child.name,
            sku: child.sku,
            options: childOptions,
            prices: data.stores[0].supported_currencies.map(({ currency_code }) => {
              return {
                amount: child.price,
                currency_code
              }
            }),
            metadata: {
              external_id: variantExternalId
            },
            id: existingVariant?.id
          }
        })

        productData.images = magentoProduct.media_gallery_entries.filter((entry) => !entry.types.includes("thumbnail")).map((entry) => {
          return {
            url: entry.file,
            metadata: {
              external_id: entry.id.toString()
            }
          }
        })

        if (productData.id) {
          productsToUpdate.set(existingProduct.id, productData)
        } else {
          productsToCreate.set(productData.external_id!, productData)
        }
      })

      return {
        productsToCreate: Array.from(productsToCreate.values()),
        productsToUpdate: Array.from(productsToUpdate.values())
      }
    })

    createProductsWorkflow.runAsStep({
      input: {
        products: productsToCreate
      }
    })

    updateProductsWorkflow.runAsStep({
      input: {
        products: productsToUpdate
      }
    })

    return new WorkflowResponse(pagination)
  }
)