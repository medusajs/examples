import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateRentalStep } from "./steps/update-rental"

type UpdateRentalWorkflowInput = {
  rental_id: string
  status: "active" | "returned" | "cancelled"
}

export const updateRentalWorkflow = createWorkflow(
  "update-rental",
  ({ rental_id, status }: UpdateRentalWorkflowInput) => {
    // Update rental status
    const updatedRental = updateRentalStep({
      rental_id,
      status,
    })

    return new WorkflowResponse(updatedRental)
  }
)

