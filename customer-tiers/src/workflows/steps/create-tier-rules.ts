import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { TIER_MODULE } from "../../modules/tier"

export type CreateTierRulesStepInput = {
  tier_id: string
  tier_rules: Array<{
    min_purchase_value: number
    currency_code: string
  }>
}

export const createTierRulesStep = createStep(
  "create-tier-rules",
  async (input: CreateTierRulesStepInput, { container }) => {
    const tierModuleService = container.resolve(TIER_MODULE)

    const createdRules = await tierModuleService.createTierRules(
      input.tier_rules.map(rule => ({
        tier_id: input.tier_id,
        min_purchase_value: rule.min_purchase_value,
        currency_code: rule.currency_code,
      }))
    )

    return new StepResponse(createdRules, createdRules)
  },
  async (createdRules, { container }) => {
    if (!createdRules?.length) {
      return
    }

    const tierModuleService = container.resolve(TIER_MODULE)
    await tierModuleService.deleteTierRules(createdRules.map(rule => rule.id))
  }
)

