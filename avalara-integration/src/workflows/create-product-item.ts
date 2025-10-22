import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateProductsWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createItemStep } from "./steps/create-item"

type WorkflowInput = {
  product_id: string
}

export const createProductItemWorkflow = createWorkflow(
  "create-product-item",
  (input: WorkflowInput) => {
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: [
        "id",
        "title",
      ],
      filters: {
        id: input.product_id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    const response = createItemStep({
      item: {
        medusaId: products[0].id,
        itemCode: products[0].id,
        description: products[0].title,
      }
    })

    updateProductsWorkflow.runAsStep({
      input: {
        products: [
          {
            id: input.product_id,
            metadata: {
              avalara_item_id: response.id
            }
          }
        ]
      }
    })
    
    return new WorkflowResponse(response)
  }
)

