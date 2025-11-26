import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { TIER_MODULE } from "../../modules/tier"

export type CreateTierStepInput = {
  name: string
  promo_id: string | null
}

export const createTierStep = createStep(
  "create-tier",
  async (input: CreateTierStepInput, { container }) => {
    const tierModuleService = container.resolve(TIER_MODULE)

    const tier = await tierModuleService.createTiers({
      name: input.name,
      promo_id: input.promo_id || null,
    })

    return new StepResponse(tier, tier)
  },
  async (tier, { container }) => {
    if (!tier) {
      return
    }

    const tierModuleService = container.resolve(TIER_MODULE)
    await tierModuleService.deleteTiers(tier.id)
  }
)

