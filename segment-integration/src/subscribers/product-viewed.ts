import type {
  SubscriberConfig,
  SubscriberArgs,
} from "@medusajs/framework"
import { trackProductViewedWorkflow } from "../workflows/track-product-viewed"

export default async function productViewedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string, customer_id?: string }>) {
  await trackProductViewedWorkflow(container)
    .run({
      input: {
        product_id: data.id,
        customer_id: data.customer_id,
      },
    })
}

export const config: SubscriberConfig = {
  event: "product.viewed",
}
