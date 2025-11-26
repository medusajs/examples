import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { TIER_MODULE } from "../../modules/tier"
import TierModuleService from "../../modules/tier/service"

export type DetermineTierStepInput = {
  currency_code: string
  purchase_value: number
}

export const determineTierStep = createStep(
  "determine-tier",
  async (input: DetermineTierStepInput, { container }) => {
    const tierModuleService: TierModuleService = container.resolve(TIER_MODULE)

    const qualifyingTier = await tierModuleService.calculateQualifyingTier(
      input.currency_code,
      input.purchase_value
    )

    return new StepResponse(qualifyingTier)
  }
)

