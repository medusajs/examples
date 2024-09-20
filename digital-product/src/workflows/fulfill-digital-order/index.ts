import {
  createWorkflow,
  WorkflowResponse
} from "@medusajs/workflows-sdk"
import {
  useRemoteQueryStep,
} from "@medusajs/core-flows"
import { sendDigitalOrderNotificationStep } from "./steps/send-digital-order-notification"

type FulfillDigitalOrderWorkflowInput = {
  id: string
}

export const fulfillDigitalOrderWorkflow = createWorkflow(
  "fulfill-digital-order",
  ({ id }: FulfillDigitalOrderWorkflowInput) => {
    const digitalProductOrder = useRemoteQueryStep({
      entry_point: "digital_product_order",
      fields: [
        "*",
        "products.*",
        "products.medias.*",
        "order.*"
      ],
      variables: {
        filters: {
          id,
        },
      },
      list: false,
      throw_if_key_not_found: true
    })

    sendDigitalOrderNotificationStep({
      digital_product_order: digitalProductOrder
    })

    return new WorkflowResponse(
      digitalProductOrder
    )
  }
)