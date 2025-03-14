import { 
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createReviewStep } from "./steps/create-review"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

type CreateReviewInput = {
  title?: string
  content: string
  rating: number
  product_id: string
  customer_id?: string
  first_name: string
  last_name: string
  status?: "pending" | "approved" | "rejected"
}

export const createReviewWorkflow = createWorkflow(
  "create-review",
  (input: CreateReviewInput) => {
    // Check product exists
    // @ts-ignore
    useQueryGraphStep({
      entity: "product",
      fields: ["id"],
      filters: {
        id: input.product_id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    // Create the review
    const review = createReviewStep(input)

    // @ts-ignore
    return new WorkflowResponse({
      review
    })
  }
)


