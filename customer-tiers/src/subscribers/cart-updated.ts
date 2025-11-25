import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { addTierPromotionToCartWorkflow } from "../workflows/add-tier-promotion-to-cart"

export default async function cartUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await addTierPromotionToCartWorkflow(container).run({
    input: {
      cart_id: data.id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "cart.updated",
}

