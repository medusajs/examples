import { createWorkflow, transform } from "@medusajs/framework/workflows-sdk"
import { CreateProductDTO, CreateProductWorkflowInputDTO, UpsertProductDTO } from "@medusajs/framework/types"
import { MagentoAttribute, MagentoProduct } from "../modules/magento/types"
import { createProductsWorkflow, updateProductsWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows"

type MigrateProductsFromMagentoWorkflowInput = {
  products: MagentoProduct[]
  attributes: MagentoAttribute[]
}

export const migrateProductsFromMagentoWorkflowId = "migrate-products-from-magento"

export const migrateProductsFromMagentoWorkflow = createWorkflow(
  {
    name: migrateProductsFromMagentoWorkflowId,
    retentionTime: 10000,
    store: true
  },
  (input: MigrateProductsFromMagentoWorkflowInput) => {
    const { data: stores } = useQueryGraphStep({
      entity: "store",
      fields: ["supported_currencies.*", "default_sales_channel_id"],
      pagination: {
        take: 1,
        skip: 0
      }
    })

    const categoryExternalIds = transform({
      input
    }, (data) => {
      const ids: string[] = []
      data.input.products.map((product) => {
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

    const { 
      productsToCreate: initialProductsToCreate,
      externalIds: externalIdFilters
    } = transform({
      input,
      stores,
      categories,
    }, (data) => {
      const externalIds: string[] = []
      const productsToCreate = data.input.products.map((product) => {
        const productData: CreateProductWorkflowInputDTO = {
          title: product.name,
          description: product.custom_attributes.find((attr) => attr.attribute_code === "description")?.value,
          status: product.status === 1 ? "published" : "draft",
          handle: product.custom_attributes.find((attr) => attr.attribute_code === "url_key")?.value,
          external_id: product.id.toString(),
          category_ids: product.extension_attributes.category_links.map((link) => {
            const category = data.categories.find((c) => c.metadata.external_id === link.category_id)
            return category?.id
          }).filter(Boolean),
          images: product.media_gallery_entries.filter((entry) => entry.types.includes("thumbnail")).map((entry) => {
            return {
              url: entry.file,
              metadata: {
                external_id: entry.id.toString()
              }
            }
          }),
          thumbnail: product.media_gallery_entries.find((entry) => entry.types.includes("thumbnail"))?.file,
          options: product.extension_attributes.configurable_product_options?.map((option) => {
            const attribute = data.input.attributes.find((attr) => attr.attribute_id === parseInt(option.attribute_id))
            return {
              title: option.label,
              values: attribute?.options.filter((opt) => {
                return option.values.find((v) => v.value_index === parseInt(opt.value))
              }).map((opt) => opt.label) || []
            }
          }) || [],
          variants: product.children?.map((child) => {
            const childOptions: Record<string, string> = {}
  
            child.custom_attributes.forEach((attr) => {
              const attrData = data.input.attributes.find((a) => a.attribute_code === attr.attribute_code)
              if (!attrData) {
                return
              }
  
              childOptions[attrData.default_frontend_label] = attrData.options.find((opt) => opt.value === attr.value)?.label || ""
            })
  
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
                external_id: child.id.toString()
              }
            }
          }),
          sales_channels: [{
            id: data.stores[0].default_sales_channel_id
          }]
        }
        externalIds.push(product.id.toString())

        return productData
      }).filter(Boolean) as CreateProductWorkflowInputDTO[]

      return {
        productsToCreate,
        externalIds
      }
    })

    const { data: existingProducts } = useQueryGraphStep({
      entity: "product",
      fields: ["id", "external_id", "variants.id", "variants.metadata"],
      filters: {
        external_id: externalIdFilters
      }
    }).config({ name: "get-existing-products" })

    const { productsToCreate, productsToUpdate } = transform({
      initialProductsToCreate,
      existingProducts
    }, (data) => {
      const productsToCreate = new Map<string, CreateProductDTO>()
      const productsToUpdate = new Map<string, UpsertProductDTO>()

      data.initialProductsToCreate.forEach((product) => {
        const existingProduct = data.existingProducts.find((p) => p.external_id === product.external_id)
        if (existingProduct) {
          productsToUpdate.set(existingProduct.id, {
            ...product,
            id: existingProduct.id,
            variants: product.variants?.map((variant) => {
              const existingVariant = existingProduct.variants.find((v) => v.metadata.external_id === variant.metadata?.external_id)
              if (existingVariant) {
                return {
                  ...variant,
                  id: existingVariant.id
                }
              } else {
                return variant
              }
            })
          })
        } else {
          productsToCreate.set(product.external_id!, product)
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
  }
)