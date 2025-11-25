import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export type ValidateTierPromotionStepInput = {
  customer: {
    has_account: boolean
    tier?: {
      promo_id?: string | null
      promotion?: {
        id?: string
        code?: string | null
        status?: string | null
      } | null
    } | null
  } | null
}

export const validateTierPromotionStep = createStep(
  "validate-tier-promotion",
  async (input: ValidateTierPromotionStepInput) => {
    if (!input.customer || !input.customer.has_account) {
      return new StepResponse(null)
    }

    const tier = input.customer.tier

    if (!tier?.promo_id || !tier.promotion || tier.promotion.status !== "active") {
      return new StepResponse({ promotion_code: null })
    }

    return new StepResponse({
      promotion_code: tier.promotion.code || null,
    })
  }
)

