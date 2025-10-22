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
        const item = transform({ products }, ({ products }) => {
          const product = products[0]
    
          return {
            id: product.metadata?.avalara_item_id as number,
            medusaId: product.id,
            itemCode: product.id,
            description: product.title,
          }
        })
        return updateItemStep({ item })
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

