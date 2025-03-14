import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { updateReviewsStep } from "./steps/update-review"

export type UpdateReviewInput = {
  id: string
  status: "pending" | "approved" | "rejected"
}[]

export const updateReviewWorkflow = createWorkflow(
  "update-review",
  (input: UpdateReviewInput) => {
    const reviews = updateReviewsStep(input)

    return new WorkflowResponse({
      reviews
    })
  }
)

