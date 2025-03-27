import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
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
import { getPaymentMethodStep } from "./steps/get-payment-method"

type WorkflowInput = {
  subscription: SubscriptionData
}

const createSubscriptionOrderWorkflow = createWorkflow(
  "create-subscription-order",
  (input: WorkflowInput) => {
    const { data: subscriptions } = useQueryGraphStep({
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
        "cart.payment_collection.payment_sessions.*",
        "cart.customer.*",
        "cart.customer.account_holder.*",
      ],
      filters: {
        id: input.subscription.id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    const paymentCollectionData = transform({
      subscriptions
    }, (data) => {
      const cart = data.subscriptions[0].cart
      return {
        currency_code: cart.currency_code,
        amount: cart.payment_collection.amount,
        metadata: cart.payment_collection.metadata
      }
    })

    const payment_collection = createPaymentCollectionsStep([
      paymentCollectionData
    ])[0]

    const defaultPaymentMethod = getPaymentMethodStep({
      customer: subscriptions[0].cart.customer,
    })

    const paymentSessionData = transform({
      payment_collection,
      subscriptions,
      defaultPaymentMethod
    }, (data) => {
      return {
        payment_collection_id: data.payment_collection.id,
        provider_id: "pp_stripe_stripe",
        customer_id: data.subscriptions[0].cart.customer.id,
        data: {
          payment_method: data.defaultPaymentMethod.id,
          off_session: true,
          confirm: true,
          capture_method: "automatic"
        },
      }
    })

    const paymentSession = createPaymentSessionsWorkflow.runAsStep({
      input: paymentSessionData
    })

    const payment = authorizePaymentSessionStep({
      id: paymentSession.id,
      context: paymentSession.context
    })

    const { order, linkDefs } = createSubscriptionOrderStep({
      subscription: input.subscription,
      cart: subscriptions[0].cart,
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