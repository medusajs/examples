import {
  createWorkflow,
  WorkflowResponse,
  when,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createTierStep } from "./steps/create-tier"
import { createTierRulesStep } from "./steps/create-tier-rules"

export type CreateTierWorkflowInput = {
  name: string
  promo_id?: string | null
  tier_rules?: Array<{
    min_purchase_value: number
    currency_code: string
  }>
}

export const createTierWorkflow = createWorkflow(
  "create-tier",
  (input: CreateTierWorkflowInput) => {
    // validate promotion if provided
    when({ input }, (data) => !!data.input.promo_id)
      .then(() => {
        useQueryGraphStep({
          entity: "promotion",
          fields: ["id"],
          filters: {
            id: input.promo_id!,
          },
          options: {
            throwIfKeyNotFound: true,
          }
        })
      })
    // Create the tier
    const tier = createTierStep({
      name: input.name,
      promo_id: input.promo_id || null,
    })

    // Create tier rules if provided
    when({ input }, (data) => {
      return !!data.input.tier_rules?.length
    }).then(() => {
      return createTierRulesStep({
        tier_id: tier.id,
        tier_rules: input.tier_rules!,
      })
    })

    // Retrieve the created tier with rules
    const { data: tiers } = useQueryGraphStep({
      entity: "tier",
      fields: ["*", "tier_rules.*"],
      filters: {
        id: tier.id,
      },
    }).config({ name: "retrieve-tier" })

    return new WorkflowResponse({
      tier: tiers[0],
    })
  }
)

