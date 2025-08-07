import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deletePayloadItemsStep } from "./steps/delete-payload-items"

type WorkflowInput = {
  product_ids: string[]
}

export const deletePayloadProductsWorkflow = createWorkflow(
  "delete-payload-products",
  ({ product_ids }: WorkflowInput) => {
    // Step to delete payload items related to products
    const deleteProductsData = transform({
      product_ids
    }, (data) => {
      return {
        collection: "products",
        where: {
          medusa_id: {
            in: data.product_ids.join(",")
          }
        }
      }
    })

    // Call the step to delete payload items
    deletePayloadItemsStep(deleteProductsData)

    return new WorkflowResponse(void 0)
  }
)