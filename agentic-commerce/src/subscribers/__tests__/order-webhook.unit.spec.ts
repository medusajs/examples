import { buildOrderWebhookEvent } from "../order-webhook"

const baseOrder = {
  id: "ord_123",
  status: "pending",
  cart: { id: "cart_123" },
  transactions: [],
}

describe("buildOrderWebhookEvent", () => {
  it("maps a placed order to order_create", () => {
    const event = buildOrderWebhookEvent(
      { ...baseOrder, fulfillments: [] },
      "order.placed",
      "https://store.example.com"
    )

    expect(event).toEqual({
      type: "order_create",
      data: {
        type: "order",
        id: "ord_123",
        checkout_session_id: "cart_123",
        permalink_url: "https://store.example.com/orders/ord_123",
        status: "confirmed",
        adjustments: [],
      },
    })
  })

  it("does not treat an empty fulfillment list as shipped", () => {
    const event = buildOrderWebhookEvent(
      { ...baseOrder, fulfillments: [] },
      "order.updated",
      "https://store.example.com"
    )

    expect(event.data.status).toBe("confirmed")
  })

  it("maps fully shipped fulfillments to shipped", () => {
    const event = buildOrderWebhookEvent(
      {
        ...baseOrder,
        fulfillments: [
          { shipped_at: "2026-07-28T10:00:00Z" },
          { shipped_at: "2026-07-28T11:00:00Z" },
        ],
      },
      "order.updated",
      "https://store.example.com"
    )

    expect(event.data.status).toBe("shipped")
  })

  it("evaluates completed before shipped", () => {
    const event = buildOrderWebhookEvent(
      {
        ...baseOrder,
        fulfillments: [{
          shipped_at: "2026-07-28T10:00:00Z",
          delivered_at: "2026-07-29T10:00:00Z",
        }],
      },
      "order.updated",
      "https://store.example.com"
    )

    expect(event.data.status).toBe("completed")
  })

  it("maps canceled orders to canceled", () => {
    const event = buildOrderWebhookEvent(
      { ...baseOrder, status: "canceled", fulfillments: [] },
      "order.updated",
      "https://store.example.com"
    )

    expect(event.data.status).toBe("canceled")
  })

  it("maps refund transactions to adjustments", () => {
    const event = buildOrderWebhookEvent(
      {
        ...baseOrder,
        fulfillments: [],
        transactions: [{
          id: "txn_refund_123",
          reference: "refund",
          amount: -15,
          created_at: "2026-07-29T12:00:00Z",
        }],
      },
      "order.updated",
      "https://store.example.com"
    )

    expect(event.data.adjustments).toEqual([{
      id: "txn_refund_123",
      type: "refund",
      occurred_at: "2026-07-29T12:00:00.000Z",
      status: "completed",
      amount: 1500,
    }])
  })
})
