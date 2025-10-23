import { createWorkflow, WorkflowResponse, transform, when } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { updateItemStep } from "./steps/update-item"
import { createProductItemWorkflow } from "./create-product-item"

type WorkflowInput = {
  product_id: string
}

export const updateProductItemWorkflow = createWorkflow(
  "update-product-item",
  (input: WorkflowInput) => {
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: [
        "id",
        "title",
        "metadata"
      ],
      filters: {
        id: input.product_id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    const createResponse = when({ products }, ({ products }) => 
      products.length > 0 && !products[0].metadata?.avalara_item_id
    )
      .then(() => {
        return createProductItemWorkflow.runAsStep({
          input: {
            product_id: input.product_id
          }
        })
      })

    const updateResponse = when({ products }, ({ products }) => 
      products.length > 0 && !!products[0].metadata?.avalara_item_id
    )
      .then(() => {
        return updateItemStep({
          item: {
            id: products[0].metadata?.avalara_item_id as number,
            medusaId: products[0].id,
            itemCode: products[0].id,
            description: products[0].title,
          }
        })
      })

    const response = transform({
      createResponse,
      updateResponse
    }, (data) => {
      return data.createResponse || data.updateResponse
    })

    return new WorkflowResponse(response)
  }
)

