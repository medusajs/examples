import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { handleOrderPointsWorkflow } from "../workflows/handle-order-points"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await handleOrderPointsWorkflow(container).run({
    input: {
      order_id: data.id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
