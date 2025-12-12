import { createWorkflow, WorkflowResponse, transform, when } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createProductsContentfulStep } from "./steps/create-products-contentful"
import { createProductOptionsContentfulStep } from "./steps/create-product-options-contentful"
import { ProductDTO, ProductOptionDTO } from "@medusajs/framework/types"

type WorkflowInput = {
  product_ids: string[]
}

export const createProductsContentfulWorkflow = createWorkflow(
  { name: "create-products-contentful-workflow" },
  (input: WorkflowInput) => {
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: [
        "id",
        "title",
        "description",
        "subtitle",
        "handle",
        "variants.id",
        "variants.title",
        "variants.options.id",
        "variants.options.value",
        "variants.options.option_id",
        "options.id",
        "options.title",
        "options.product_id",
        "options.values.id",
        "options.values.value",
      ],
      filters: {
        id: input.product_ids,
      },
    })
    
    // Extract unique options from products using transform
    const uniqueOptions = transform(
      { products },
      (data): ProductOptionDTO[] => {
        const productData = data.products as unknown as ProductDTO[]
        const optionsMap = new Map<string, ProductOptionDTO>()
        
        productData.forEach((product) => {
          product.options?.forEach((option) => {
            if (!optionsMap.has(option.id)) {
              optionsMap.set(option.id, option)
            }
          })
        })
        
        return Array.from(optionsMap.values())
      }
    )

    // Sync options first if any exist (this ensures options are available before products reference them)
    when({ uniqueOptions }, ({ uniqueOptions }) => uniqueOptions.length > 0)
      .then(() => {
        createProductOptionsContentfulStep({
          options: uniqueOptions,
        })
      })
    
    // Then sync products (which will reference the options)
    const contentfulProducts = createProductsContentfulStep({
      products: products as unknown as ProductDTO[],
    })

    return new WorkflowResponse(contentfulProducts)
  }
)