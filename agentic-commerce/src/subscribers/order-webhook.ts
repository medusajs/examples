import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { AGENTIC_COMMERCE_MODULE } from "../modules/agentic-commerce"
import { AgenticCommerceWebhookEvent } from "../modules/agentic-commerce/service"

export default async function orderWebhookHandler({
  event: { data, name },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id
  const query = container.resolve("query")
  const agenticCommerceModuleService = container.resolve(AGENTIC_COMMERCE_MODULE)
  const configModule = container.resolve("configModule")
  const storefrontUrl = configModule.admin.storefrontUrl || process.env.STOREFRONT_URL

  const { data: [order] } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "cart.id",
      "cart.metadata",
      "status",
      "fulfillments.*",
      "transactions.*",
    ],
    filters: {
      id: orderId,
    }
  })

  if (!order || !order.cart?.metadata?.is_checkout_session) {
    return
  }

  const webhookEvent: AgenticCommerceWebhookEvent = {
    type: name === "order.placed" ? "order.created" : "order.updated",
    data: {
      type: "order",
      checkout_session_id: order.cart.id,
      permalink_url: `${storefrontUrl}/orders/${order.id}`,
      status: "confirmed",
      refunds: order.transactions?.filter(
        (transaction) => transaction?.reference === "refund"
      ).map((transaction) => ({
        type: "original_payment",
        amount: transaction!.amount * -1,
      })) || [],
    }
  }

  // set status
  if (order.status === "canceled") {
    webhookEvent.data.status = "canceled"
  } else {
    const allFulfillmentsShipped = order.fulfillments?.every((fulfillment) => !!fulfillment?.shipped_at)
    const allFulfillmentsDelivered = order.fulfillments?.every((fulfillment) => !!fulfillment?.delivered_at)
    if (allFulfillmentsShipped) {
      webhookEvent.data.status = "shipping"
    } else if (allFulfillmentsDelivered) {
      webhookEvent.data.status = "fulfilled"
    }
  }

  await agenticCommerceModuleService.sendWebhookEvent(webhookEvent)
}

export const config: SubscriberConfig = {
  event: ["order.placed", "order.updated"],
}