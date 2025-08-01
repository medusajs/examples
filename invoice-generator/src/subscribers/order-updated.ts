import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { markInvoicesStaleWorkflow } from "../workflows/mark-invoices-stale"

type EventPayload = {
  id: string
} | {
  order_id: string
}

export default async function orderUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<EventPayload>) {
  const orderId = "id" in data ? data.id : data.order_id

  await markInvoicesStaleWorkflow(container)
    .run({
      input: {
        order_id: orderId
      }
    })
}

export const config: SubscriberConfig = {
  event: [
    "order.updated", 
    "order-edit.confirmed",
    "order.exchange_created",
    "order.claim_created",
    "order.return_received"
  ],
}