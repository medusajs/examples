import { 
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { trackEventStep } from "./steps/track-event"

type WorkflowInput = {
  id: string
}

export const trackOrderPlacedWorkflow = createWorkflow(
  "track-order-placed",
  ({ id }: WorkflowInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "email",
        "total",
        "currency_code",
        "items.*",
        "customer.id",
        "customer.email",
        "customer.first_name",
        "customer.last_name",
        "created_at"
      ],
      filters: {
        id,
      },
    })

    const order = transform({
      order: orders[0],
    }, ({ order }) => ({
      orderId: order.id,
      email: order.email,
      total: order.total,
      currency: order.currency_code,
      items: order.items?.map((item) => ({
        id: item?.id,
        title: item?.title,
        quantity: item?.quantity,
        variant: item?.variant,
        unit_price: item?.unit_price
      })),
      customer: {
        id: order.customer?.id,
        email: order.customer?.email,
        firstName: order.customer?.first_name,
        lastName: order.customer?.last_name
      },
      timestamp: order.created_at
    }))

    trackEventStep({
      event: "order.placed",
      userId: order.customer?.id,
      properties: order
    })
  }
)
