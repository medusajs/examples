import { 
  createWorkflow, 
} from "@medusajs/framework/workflows-sdk"
import { sendNotificationsStep, useQueryGraphStep } from "@medusajs/medusa/core-flows"

type WorkflowInput = {
  id: string
}

export const orderPlacedNotificationWorkflow = createWorkflow(
  "order-placed-notification",
  ({ id }: WorkflowInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "display_id", 
        "email",
        "shipping_address.*",
        "subtotal",
        "shipping_total",
        "currency_code", 
        "discount_total",
        "tax_total",
        "total",
        "items.*",
        "original_total"
      ],
      filters: {
        id,
      },
    })

    sendNotificationsStep([{
      to: "slack-channel", // This will be configured in the Slack app
      channel: "slack",
      template: "order-created",
      data: {
        order: orders[0]
      }
    }])
  }
)
