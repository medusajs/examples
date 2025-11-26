import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError } from "@medusajs/framework/utils"

completeCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  const query = container.resolve("query")

  // Get cart with promotions
  const { data: [detailedCart] } = await query.graph({
    entity: "cart",
    fields: ["id", "promotions.*", "customer.id", "customer.tier.*"],
    filters: {
      id: cart.id,
    },
  }, {
    throwIfKeyNotFound: true,
  })

  if (!detailedCart?.promotions || detailedCart.promotions.length === 0) {
    return
  }

  // Get customer's tier
  const customerTier = detailedCart.customer?.tier

  // Get all tier promotions to check
  const { data: allTiers } = await query.graph({
    entity: "tier",
    fields: ["id", "promo_id"],
    filters: {
      promo_id: detailedCart.promotions.map((p) => p?.id).filter(Boolean) as string[]
    }
  })

  // Validate that if a tier promotion is applied, the customer belongs to that tier
  for (const promotion of detailedCart.promotions) {
    const tierId = allTiers.find((t) => t.promo_id === promotion?.id)?.id
    if (tierId && customerTier?.id !== tierId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Promotion ${promotion?.code || promotion?.id} can only be applied by customers in the corresponding tier.`
      )
    }
  }
})

