import { createWorkflow } from "@medusajs/workflows-sdk"
import { 
  useRemoteQueryStep,
  createPaymentSessionsWorkflow,
  createRemoteLinkStep,
  capturePaymentStep
} from "@medusajs/core-flows"
import { 
  CartWorkflowDTO
} from "@medusajs/types"
import { 
  SubscriptionData
} from "../../modules/subscription/types"
import { 
  authorizePaymentSessionStep
} from "@medusajs/core-flows/dist/payment/steps/authorize-payment-session"
import { 
  createPaymentCollectionsStep
} from "@medusajs/core-flows/dist/definition/cart/steps/create-payment-collection"
import createSubscriptionOrderStep from "./steps/create-subscription-order"
import updateSubscriptionStep from "./steps/update-subscription"

type WorkflowInput = {
  subscription: SubscriptionData
}

const createSubscriptionOrderWorkflow = createWorkflow(
  "create-subscription-order",
  (input: WorkflowInput) => {
    const { cart } = useRemoteQueryStep({
      entry_point: "subscription",
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
      variables: {
        filters: {
          id: [input.subscription.id]
        }
      },
      list: false,
      throw_if_key_not_found: true,
    }) as {
      cart: CartWorkflowDTO
    }

    const payment_collection = createPaymentCollectionsStep([{
      region_id: cart.region_id,
      currency_code: cart.currency_code,
      amount: cart.payment_collection.amount,
      metadata: cart.payment_collection.metadata
    }])[0]

    const paymentSession = createPaymentSessionsWorkflow.runAsStep({
      input: {
        payment_collection_id: payment_collection.id,
        provider_id: cart.payment_collection.payment_sessions[0].provider_id,
        data: cart.payment_collection.payment_sessions[0].data,
        context: cart.payment_collection.payment_sessions[0].context
      }
    })

    const payment = authorizePaymentSessionStep({
      id: paymentSession.id,
      context: paymentSession.context
    })

    const { order, linkDefs } = createSubscriptionOrderStep({
      subscription: input.subscription,
      cart,
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

    return {
      order
    }
  }
)

export default createSubscriptionOrderWorkflow