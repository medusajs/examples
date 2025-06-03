import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { orderPlacedNotificationWorkflow } from "../workflows/order-placed-notification";

export default async function orderPlacedHandler({
  event: { data },
  container
}: SubscriberArgs<{ id: string }>) {
  await orderPlacedNotificationWorkflow(container)
    .run({
      input: data
    })
}

export const config: SubscriberConfig = {
  event: "order.placed"
}