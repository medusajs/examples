import { createWorkflow, WorkflowResponse, transform, when } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createProductsContentfulStep } from "./steps/create-products-contentful"
import { createProductOptionsContentfulStep } from "./steps/create-product-options-contentful"
import { getOptionsContentfulStep } from "./steps/get-options-contentful"
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

    // Get existing options from Contentful
    const optionIds = transform(
      { uniqueOptions },
      (data) => data.uniqueOptions.map((option) => option.id)
    )

    const existingOptions = getOptionsContentfulStep({
      option_ids: optionIds,
    })

    // Filter out existing options and only create new ones
    const newOptions = transform(
      { uniqueOptions, existingOptions },
      (data) => {
        const existingIdsSet = new Set(data.existingOptions.map(option => option.sys.id))
        return data.uniqueOptions.filter(
          (option) => !existingIdsSet.has(option.id)
        )
      }
    )

    // Only create options that don't already exist in Contentful
    when({ newOptions }, (data) => data.newOptions.length > 0)
      .then(() => {
        createProductOptionsContentfulStep({
          options: newOptions,
        })
      })
    
    // Then sync products (which will reference the options)
    const contentfulProducts = createProductsContentfulStep({
      products: products as unknown as ProductDTO[],
    })

    return new WorkflowResponse(contentfulProducts)
  }
)