import { createWorkflow, WorkflowResponse, transform } from "@medusajs/framework/workflows-sdk"
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

    const stepInput = transform({ products }, ({ products }) => {
      const product = products[0]

      return {
        item: {
          medusaId: product.id,
          itemCode: product.id,
          description: product.title,
        }
      }
    })

    const response = createItemStep(stepInput)

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

