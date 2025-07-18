import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { OrderChangeActionDTO } from "@medusajs/framework/types"
import { handleOrderEditWorkflow } from "../workflows/handle-order-edit"

export default async function orderEditConfirmedHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  order_id: string,
  actions: OrderChangeActionDTO[]
}>) {
  await handleOrderEditWorkflow(container).run({
    input: {
      order_id: data.order_id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "order-edit.confirmed",
}