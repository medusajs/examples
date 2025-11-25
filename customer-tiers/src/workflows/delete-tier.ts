import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { deleteTierStep } from "./steps/delete-tier"

export type DeleteTierWorkflowInput = {
  id: string
}

export const deleteTierWorkflow = createWorkflow(
  "delete-tier",
  (input: DeleteTierWorkflowInput) => {
    // Delete the tier (which also deletes tier rules)
    const result = deleteTierStep({
      id: input.id,
    })

    return new WorkflowResponse(result)
  }
)

