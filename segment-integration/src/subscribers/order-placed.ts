import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { trackOrderPlacedWorkflow } from "../workflows/track-order-placed"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await trackOrderPlacedWorkflow(container)
    .run({
      input: {
        id: data.id,
      },
    })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
