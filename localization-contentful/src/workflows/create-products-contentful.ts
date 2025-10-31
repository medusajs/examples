import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createProductsContentfulStep } from "./steps/create-products-contentful"
import { ProductDTO } from "@medusajs/framework/types"

type WorkflowInput = {
  product_ids: string[]
}

export const createProductsContentfulWorkflow = createWorkflow(
  { name: "create-products-contentful-workflow" },
  (input: WorkflowInput) => {
    const { data } = useQueryGraphStep({
      entity: "product",
      fields: [
        "id",
        "title",
        "description",
        "subtitle",
        "status",
        "handle",
        "variants.*",
        "variants.options.*",
        "options.*",
        "options.values.*",
      ],
      filters: {
        id: input.product_ids,
      },
    })
    
    const contentfulProducts = createProductsContentfulStep({
      products: data as unknown as ProductDTO[],
    })

    return new WorkflowResponse(contentfulProducts)
  }
)