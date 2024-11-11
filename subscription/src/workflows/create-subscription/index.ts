import { 
  createWorkflow,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { 
  createRemoteLinkStep,
  completeCartWorkflow,
  useRemoteQueryStep
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

    const order = useRemoteQueryStep({
      entry_point: "order",
      fields: ["*", "id", "customer_id"],
      variables: {
        filters: {
          id
        }
      },
      list: false,
      throw_if_key_not_found: true
    })

    const { subscription, linkDefs } = createSubscriptionStep({
      cart_id: input.cart_id,
      order_id: order.id,
      customer_id: order.customer_id,
      subscription_data: input.subscription_data
    })

    createRemoteLinkStep(linkDefs)

    return new WorkflowResponse({
      subscription: subscription,
      order: order
    })
  }
)

export default createSubscriptionWorkflow