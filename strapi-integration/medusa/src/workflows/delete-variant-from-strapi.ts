import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  deleteVariantFromStrapiStep,
} from "./steps/delete-variant-from-strapi"

export type DeleteVariantFromStrapiWorkflowInput = {
  id: string
}

export const deleteVariantFromStrapiWorkflow = createWorkflow(
  "delete-variant-from-strapi",
  (input: DeleteVariantFromStrapiWorkflowInput) => {
    deleteVariantFromStrapiStep(input)

    return new WorkflowResponse(void 0)
  }
)

