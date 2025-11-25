import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError } from "@medusajs/framework/utils"

completeCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  const query = container.resolve("query")

  // Get customer details
  const data = cart.customer_id ? await query.graph({
    entity: "customer",
    fields: ["id", "tier.*"],
    filters: {
      id: cart.customer_id,
    },
  }) : null

  // Get cart with promotions
  const { data: [cartWithPromotions] } = await query.graph({
    entity: "cart",
    fields: ["id", "promotions.*"],
    filters: {
      id: cart.id,
    },
  }, {
    throwIfKeyNotFound: true,
  })

  if (!cartWithPromotions?.promotions || cartWithPromotions.promotions.length === 0) {
    return
  }

  // Get customer's tier
  const customerTier = data?.data?.[0].tier

  // Get all tier promotions to check
  const { data: allTiers } = await query.graph({
    entity: "tier",
    fields: ["id", "promo_id"],
    filters: {
      promo_id: cartWithPromotions.promotions.map((p) => p?.id).filter(Boolean) as string[]
    }
  })

  // Validate that if a tier promotion is applied, the customer belongs to that tier
  for (const promotion of cartWithPromotions.promotions) {
    const tierId = allTiers.find((t) => t.promo_id === promotion?.id)?.id
    if (tierId && customerTier?.id !== tierId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Promotion ${promotion?.code || promotion?.id} can only be applied by customers in the corresponding tier.`
      )
    }
  }
})

