import { updateCartPromotionsWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError } from "@medusajs/framework/utils"
import { PromotionActions } from "@medusajs/framework/utils"

updateCartPromotionsWorkflow.hooks.validate(async ({ input, cart }, { container }) => {
  const query = container.resolve("query")

  // Only validate when adding promotions
  if (
    (input.action !== PromotionActions.ADD && input.action !== PromotionActions.REPLACE) || 
    !input.promo_codes || input.promo_codes.length === 0
  ) {
    return
  }

  // Get customer details with tier
  const data = cart.customer_id ? await query.graph({
    entity: "customer",
    fields: ["id", "tier.*"],
    filters: {
      id: cart.customer_id,
    },
  }) : null

  // Get customer's tier
  const customerTier = data?.data?.[0]?.tier

  // Get promotions by codes to check if they're tier promotions
  const { data: promotions } = await query.graph({
    entity: "promotion",
    fields: ["id", "code"],
    filters: {
      code: input.promo_codes,
    },
  })

  // Get all tiers with their promotion IDs
  const { data: allTiers } = await query.graph({
    entity: "tier",
    fields: ["id", "promo_id"],
    filters: {
      promo_id: promotions.map((p) => p.id)
    }
  })

  // Validate each promotion being added
  for (const promotion of promotions || []) {
    const tierId = allTiers.find((t) => t.promo_id === promotion?.id)?.id
    
    // If this promotion belongs to a tier
    if (tierId && customerTier?.id !== tierId) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Promotion ${promotion.code || promotion.id} can only be applied by customers in the corresponding tier.`
        )
    }
  }
})

