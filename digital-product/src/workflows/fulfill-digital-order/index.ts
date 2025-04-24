import {
  createWorkflow,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import {
  markOrderFulfillmentAsDeliveredWorkflow,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { sendDigitalOrderNotificationStep } from "./steps/send-digital-order-notification"

type FulfillDigitalOrderWorkflowInput = {
  id: string
}

export const fulfillDigitalOrderWorkflow = createWorkflow(
  "fulfill-digital-order",
  ({ id }: FulfillDigitalOrderWorkflowInput) => {
    const { data: digitalProductOrders } = useQueryGraphStep({
      entity: "digital_product_order",
      fields: [
        "*",
        "products.*",
        "products.medias.*",
        "order.*",
        "order.fulfillments.*"
      ],
      filters: {
        id,
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    sendDigitalOrderNotificationStep({
      digital_product_order: digitalProductOrders[0]
    })

    markOrderFulfillmentAsDeliveredWorkflow.runAsStep({
      input: {
        orderId: digitalProductOrders[0].order.id,
        fulfillmentId: digitalProductOrders[0].order.fulfillments[0].id
      }
    })

    return new WorkflowResponse(
      digitalProductOrders[0]
    )
  }
)