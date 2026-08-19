import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { AGENTIC_COMMERCE_MODULE } from "../modules/agentic-commerce"
import { AgenticCommerceWebhookEvent } from "../modules/agentic-commerce/service"

type OrderWebhookInput = {
  id: string
  status: string
  cart: {
    id: string
  } | null
  fulfillments?: ({
    shipped_at?: string | Date | null
    delivered_at?: string | Date | null
  } | null)[] | null
  transactions?: ({
    id: string
    reference?: string | null
    amount: number
    created_at: string | Date
  } | null)[] | null
}

export function buildOrderWebhookEvent(
  order: OrderWebhookInput,
  eventName: string,
  storefrontUrl: string
): AgenticCommerceWebhookEvent {
  if (!order.cart) {
    throw new Error("Cannot build an ACP order webhook without a cart")
  }

  const fulfillments = (order.fulfillments || []).filter(
    (fulfillment): fulfillment is NonNullable<typeof fulfillment> =>
      !!fulfillment
  )
  let status: AgenticCommerceWebhookEvent["data"]["status"] = "confirmed"

  if (order.status === "canceled") {
    status = "canceled"
  } else if (
    fulfillments.length > 0 &&
    fulfillments.every((fulfillment) => !!fulfillment.delivered_at)
  ) {
    status = "completed"
  } else if (
    fulfillments.length > 0 &&
    fulfillments.every((fulfillment) => !!fulfillment.shipped_at)
  ) {
    status = "shipped"
  }

  return {
    type: eventName === "order.placed" ? "order_create" : "order_update",
    data: {
      type: "order",
      id: order.id,
      checkout_session_id: order.cart.id,
      permalink_url: `${storefrontUrl}/orders/${order.id}`,
      status,
      adjustments: order.transactions?.filter(
        (transaction): transaction is NonNullable<typeof transaction> =>
          !!transaction && transaction.reference === "refund"
      ).map((transaction) => ({
        id: transaction.id,
        type: "refund",
        occurred_at: new Date(transaction.created_at).toISOString(),
        status: "completed",
        amount: Math.abs(transaction.amount) * 100,
      })) || [],
    }
  }
}

export default async function orderWebhookHandler({
  event: { data, name },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id
  const query = container.resolve("query")
  const agenticCommerceModuleService = container.resolve(AGENTIC_COMMERCE_MODULE)
  const configModule = container.resolve("configModule")
  const storefrontUrl = configModule.admin.storefrontUrl || process.env.STOREFRONT_URL

  if (!storefrontUrl) {
    throw new Error("A storefront URL is required to send ACP order webhooks")
  }

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

  const webhookEvent = buildOrderWebhookEvent(order, name, storefrontUrl)

  await agenticCommerceModuleService.sendWebhookEvent(webhookEvent)
}

export const config: SubscriberConfig = {
  event: ["order.placed", "order.updated"],
}
