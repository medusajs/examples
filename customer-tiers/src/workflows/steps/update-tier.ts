import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { TIER_MODULE } from "../../modules/tier"
import TierModuleService from "../../modules/tier/service"

export type UpdateTierStepInput = {
  id: string
  name: string
  promo_id: string | null
}

export const updateTierStep = createStep(
  "update-tier",
  async (input: UpdateTierStepInput, { container }) => {
    const tierModuleService: TierModuleService = container.resolve(TIER_MODULE)

    const originalTier = await tierModuleService.retrieveTier(input.id)

    const tier = await tierModuleService.updateTiers(input)

    return new StepResponse(tier, originalTier)
  },
  async (originalInput, { container }) => {
    if (!originalInput) {
      return
    }

    const tierModuleService = container.resolve(TIER_MODULE)
    
    await tierModuleService.updateTiers({
      id: originalInput.id,
      name: originalInput.name,
      promo_id: originalInput.promo_id,
    })
  }
)

