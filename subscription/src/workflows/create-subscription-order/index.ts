import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { 
  useQueryGraphStep,
  createPaymentSessionsWorkflow,
  createRemoteLinkStep,
  capturePaymentStep
} from "@medusajs/medusa/core-flows"
import { 
  SubscriptionData
} from "../../modules/subscription/types"
import { 
  authorizePaymentSessionStep,
  createPaymentCollectionsStep
} from "@medusajs/medusa/core-flows"
import createSubscriptionOrderStep from "./steps/create-subscription-order"
import updateSubscriptionStep from "./steps/update-subscription"

type WorkflowInput = {
  subscription: SubscriptionData
}

const createSubscriptionOrderWorkflow = createWorkflow(
  "create-subscription-order",
  (input: WorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "subscription",
      fields: [
        "*",
        "cart.*",
        "cart.items.*",
        "cart.items.tax_lines.*",
        "cart.items.adjustments.*",
        "cart.shipping_address.*",
        "cart.billing_address.*",
        "cart.shipping_methods.*",
        "cart.shipping_methods.tax_lines.*",
        "cart.shipping_methods.adjustments.*",
        "cart.payment_collection.*",
        "cart.payment_collection.payment_sessions.*"
      ],
      filters: {
        id: [input.subscription.id]
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    const payment_collection = createPaymentCollectionsStep([{
      region_id: carts[0].region_id,
      currency_code: carts[0].currency_code,
      amount: carts[0].payment_collection.amount,
      metadata: carts[0].payment_collection.metadata
    }])[0]

    const paymentSession = createPaymentSessionsWorkflow.runAsStep({
      input: {
        payment_collection_id: payment_collection.id,
        provider_id: carts[0].payment_collection.payment_sessions[0].provider_id,
        data: carts[0].payment_collection.payment_sessions[0].data,
        context: carts[0].payment_collection.payment_sessions[0].context
      }
    })

    const payment = authorizePaymentSessionStep({
      id: paymentSession.id,
      context: paymentSession.context
    })

    const { order, linkDefs } = createSubscriptionOrderStep({
      subscription: input.subscription,
      cart: carts[0],
      payment_collection
    })

    createRemoteLinkStep(linkDefs)

    capturePaymentStep({
      payment_id: payment.id,
      amount: payment.amount
    })

    updateSubscriptionStep({
      subscription_id: input.subscription.id
    })

    return new WorkflowResponse({
      order
    })
  }
)

export default createSubscriptionOrderWorkflow