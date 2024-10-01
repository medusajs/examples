import { 
  createStep, 
  StepResponse
} from "@medusajs/framework/workflows-sdk"
import { 
  SUBSCRIPTION_MODULE
} from "../../../modules/subscription"
import SubscriptionModuleService from "../../../modules/subscription/service"

type StepInput = {
  subscription_id: string
}

const updateSubscriptionStep = createStep(
  "update-subscription",
  async ({ subscription_id }: StepInput, { container }) => {
    const subscriptionModuleService: SubscriptionModuleService = 
      container.resolve(
        SUBSCRIPTION_MODULE
      )

    const prevSubscriptionData = await subscriptionModuleService
      .retrieveSubscription(
        subscription_id
      )

    const subscription = await subscriptionModuleService
      .recordNewSubscriptionOrder(
        subscription_id
      )

    return new StepResponse({
      subscription
    }, {
      prev_data: prevSubscriptionData
    })
  },
  async ({ 
    prev_data
  }, { container }) => {
    const subscriptionModuleService: SubscriptionModuleService = 
      container.resolve(
        SUBSCRIPTION_MODULE
      )

    await subscriptionModuleService.updateSubscriptions({
      id: prev_data.id,
      last_order_date: prev_data.last_order_date,
      next_order_date: prev_data.next_order_date,
    })
  }
)

export default updateSubscriptionStep