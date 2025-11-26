import { MedusaService } from "@medusajs/framework/utils"
import { Tier } from "./models/tier"
import { TierRule } from "./models/tier-rule"

class TierModuleService extends MedusaService({
  Tier,
  TierRule,
}) {
  async calculateQualifyingTier(
    currencyCode: string,
    purchaseValue: number,
  ) {
    const rules = await this.listTierRules(
      {
        currency_code: currencyCode,
      },
    )

    if (!rules || rules.length === 0) {
      return null
    }

    const sortedRules = rules.sort(
      (a, b) => b.min_purchase_value - a.min_purchase_value
    )

    const qualifyingRule = sortedRules.find(
      (rule) => purchaseValue >= rule.min_purchase_value
    )

    return qualifyingRule?.tier?.id || null
  }

  async calculateNextTierUpgrade(
    currencyCode: string,
    currentPurchaseValue: number,
  ) {
    const rules = await this.listTierRules(
      {
        currency_code: currencyCode,
      },
      {
        relations: ["tier"],
      }
    )
    
    // Sort rules by min_purchase_value ascending
    const sortedRules = rules.sort(
      (a, b) => a.min_purchase_value - b.min_purchase_value
    )

    // Find the next tier the customer hasn't reached
    const nextRule = sortedRules.find(
      (rule) => rule.min_purchase_value > currentPurchaseValue
    )

    if (!nextRule || !nextRule.tier) {
      return null
    }

    const requiredAmount = nextRule.min_purchase_value - currentPurchaseValue

    return {
      tier: nextRule.tier,
      required_amount: requiredAmount,
      current_purchase_value: currentPurchaseValue,
      next_tier_min_purchase: nextRule.min_purchase_value,
    }
  }

}

export default TierModuleService

