import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  deleteOptionFromStrapiStep,
} from "./steps/delete-option-from-strapi"

export type DeleteOptionFromStrapiWorkflowInput = {
  id: string
}

export const deleteOptionFromStrapiWorkflow = createWorkflow(
  "delete-option-from-strapi",
  (input: DeleteOptionFromStrapiWorkflowInput) => {
    deleteOptionFromStrapiStep(input)

    return new WorkflowResponse(void 0)
  }
)

