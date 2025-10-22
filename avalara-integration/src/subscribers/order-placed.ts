import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { createOrderTransactionWorkflow } from "../workflows/create-order-transaction"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await createOrderTransactionWorkflow(container).run({
    input: {
      order_id: data.id
    }
  })
}

export const config: SubscriberConfig = {
  event: `order.placed`,
}