import { 
  createWorkflow,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { 
  createRemoteLinkStep,
  completeCartWorkflow,
  useQueryGraphStep
} from "@medusajs/medusa/core-flows"
import { 
  SubscriptionInterval
} from "../../modules/subscription/types"
import createSubscriptionStep from "./steps/create-subscription"

type WorkflowInput = {
  cart_id: string,
  subscription_data: {
    interval: SubscriptionInterval
    period: number
  }
}

const createSubscriptionWorkflow = createWorkflow(
  "create-subscription",
  (input: WorkflowInput) => {
    const { id } = completeCartWorkflow.runAsStep({
      input: {
        id: input.cart_id
      }
    })

    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "status",
        "summary",
        "currency_code",
        "customer_id",
        "display_id",
        "region_id",
        "email",
        "total",
        "subtotal",
        "tax_total",
        "discount_total",
        "discount_subtotal",
        "discount_tax_total",
        "original_total",
        "original_tax_total",
        "item_total",
        "item_subtotal",
        "item_tax_total",
        "original_item_total",
        "original_item_subtotal",
        "original_item_tax_total",
        "shipping_total",
        "shipping_subtotal",
        "shipping_tax_total",
        "original_shipping_tax_total",
        "original_shipping_subtotal",
        "original_shipping_total",
        "created_at",
        "updated_at",
        "credit_lines.*",
        "items.*",
        "items.tax_lines.*",
        "items.adjustments.*",
        "items.detail.*",
        "items.variant.*",
        "items.variant.product.*",
        "shipping_address.*",
        "billing_address.*",
        "shipping_methods.*",
        "shipping_methods.tax_lines.*",
        "shipping_methods.adjustments.*",
        "payment_collections.*",
      ],
      filters: {
        id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    const { subscription, linkDefs } = createSubscriptionStep({
      cart_id: input.cart_id,
      order_id: orders[0].id,
      customer_id: orders[0].customer_id,
      subscription_data: input.subscription_data
    })

    createRemoteLinkStep(linkDefs)

    return new WorkflowResponse({
      subscription: subscription,
      order: orders[0]
    })
  }
)

export default createSubscriptionWorkflow