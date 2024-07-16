import { 
  createWorkflow,
} from "@medusajs/workflows-sdk"
import { 
  createRemoteLinkStep,
  completeCartWorkflow
} from "@medusajs/core-flows"
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
    const order = completeCartWorkflow.runAsStep({
      input: {
        id: input.cart_id
      }
    })

    const { subscription, linkDefs } = createSubscriptionStep({
      cart_id: input.cart_id,
      order_id: order.id,
      customer_id: order.customer_id,
      subscription_data: input.subscription_data
    })

    createRemoteLinkStep(linkDefs)

    return {
      subscription: subscription,
      order: order
    }
  }
)

export default createSubscriptionWorkflow