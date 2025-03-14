import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
import ProductReviewModuleService from "../../modules/product-review/service"

export type UpdateReviewsStepInput = {
  id: string
  status: "pending" | "approved" | "rejected"
}[]

export const updateReviewsStep = createStep(
  "update-review",
  async (input: UpdateReviewsStepInput, { container }) => {
    const reviewModuleService: ProductReviewModuleService = container.resolve(
      PRODUCT_REVIEW_MODULE
    )

    // Get original review before update
    const originalReviews = await reviewModuleService.listReviews({
      id: input.map((review) => review.id)
    })

    const reviews = await reviewModuleService.updateReviews(input)

    return new StepResponse(reviews, originalReviews)
  },
  async (originalData, { container }) => {
    if (!originalData) {
      return
    }

    const reviewModuleService: ProductReviewModuleService = container.resolve(
      PRODUCT_REVIEW_MODULE
    )

    // Restore original review status
    await reviewModuleService.updateReviews(originalData)
  }
)



