import {
  createWorkflow,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import {
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
        "order.*"
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

    return new WorkflowResponse(
      digitalProductOrders[0]
    )
  }
)