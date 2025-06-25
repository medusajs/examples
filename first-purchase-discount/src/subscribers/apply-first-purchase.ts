import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { applyFirstPurchasePromoWorkflow } from "../workflows/apply-first-purchase-promo"

export default async function cartCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  id: string
}>) {
  await applyFirstPurchasePromoWorkflow(container)
  .run({
    input: {
      cart_id: data.id
    }
  })
}

export const config: SubscriberConfig = {
  event: ["cart.created", "cart.customer_transferred"],
}