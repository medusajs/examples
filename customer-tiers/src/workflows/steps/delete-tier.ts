import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { TIER_MODULE } from "../../modules/tier"
import TierModuleService from "../../modules/tier/service"

export type DeleteTierStepInput = {
  id: string
}

export const deleteTierStep = createStep(
  "delete-tier",
  async (input: DeleteTierStepInput, { container }) => {
    const tierModuleService: TierModuleService = container.resolve(TIER_MODULE)

    // Get tier data before deletion for compensation
    const tier = await tierModuleService.retrieveTier(input.id, {
      relations: ["tier_rules"],
    })

    // Delete tier
    await tierModuleService.deleteTiers(input.id)

    return new StepResponse(
      { id: input.id, deleted: true },
      { tier }
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData || !compensationData.tier) {
      return
    }

    const tierModuleService = container.resolve(TIER_MODULE)
    
    // Restore tier
    const restoredTier = await tierModuleService.createTiers({
      name: compensationData.tier.name,
      promo_id: compensationData.tier.promo_id,
    })

    // Restore tier rules
    await tierModuleService.createTierRules(compensationData.tier.tier_rules.map(rule => ({
      tier_id: restoredTier.id,
      min_purchase_value: rule.min_purchase_value,
      currency_code: rule.currency_code,
    })))
  }
)

