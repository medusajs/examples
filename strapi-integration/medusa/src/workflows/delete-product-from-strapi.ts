import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  deleteProductFromStrapiStep,
} from "./steps/delete-product-from-strapi"

export type DeleteProductFromStrapiWorkflowInput = {
  id: string
}

export const deleteProductFromStrapiWorkflow = createWorkflow(
  "delete-product-from-strapi",
  (input: DeleteProductFromStrapiWorkflowInput) => {
    deleteProductFromStrapiStep(input)

    return new WorkflowResponse(void 0)
  }
)

