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
      fields: ["*", "id", "customer_id"],
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