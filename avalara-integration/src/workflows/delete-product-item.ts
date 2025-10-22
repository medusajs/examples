import { createWorkflow, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deleteItemStep } from "./steps/delete-item"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

type WorkflowInput = {
  product_id: string
}

export const deleteProductItemWorkflow = createWorkflow(
  "delete-product-item",
  (input: WorkflowInput) => {
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: [
        "id",
        "metadata"
      ],
      filters: {
        id: input.product_id
      },
      withDeleted: true,
      options: {
        throwIfKeyNotFound: true
      }
    })

    when({ products }, ({ products }) =>
      products.length > 0 && !!products[0].metadata?.avalara_item_id
    )
    .then(() => {
      deleteItemStep({ item_id: products[0].metadata!.avalara_item_id as number })
    })

    return new WorkflowResponse(void 0)
  }
)

