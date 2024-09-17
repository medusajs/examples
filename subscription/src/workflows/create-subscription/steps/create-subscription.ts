import { createStep, StepResponse } from "@medusajs/workflows-sdk"
import { Modules } from "@medusajs/utils"
import { LinkDefinition } from "@medusajs/types"
import { SubscriptionInterval } from "../../../modules/subscription/types"
import SubscriptionModuleService from "../../../modules/subscription/service"
import { SUBSCRIPTION_MODULE } from "../../../modules/subscription"

type StepInput = {
  cart_id: string
  order_id: string
  customer_id?: string
  subscription_data: {
    interval: SubscriptionInterval
    period: number
  }
}

const createSubscriptionStep = createStep(
  "create-subscription",
  async ({ 
    cart_id, 
    order_id, 
    customer_id,
    subscription_data
  }: StepInput, { container }) => {
    const subscriptionModuleService: SubscriptionModuleService = 
      container.resolve(SUBSCRIPTION_MODULE)
    const linkDefs: LinkDefinition[] = []

    const subscription = await subscriptionModuleService.createSubscriptions({
      ...subscription_data,
      metadata: {
        main_order_id: order_id
      }
    })

    linkDefs.push({
      [SUBSCRIPTION_MODULE]: {
        "subscription_id": subscription[0].id
      },
      [Modules.ORDER]: {
        "order_id": order_id
      }
    })

    linkDefs.push({
      [SUBSCRIPTION_MODULE]: {
        "subscription_id": subscription[0].id
      },
      [Modules.CART]: {
        "cart_id": cart_id
      }
    })

    if (customer_id) {
      linkDefs.push({
        [SUBSCRIPTION_MODULE]: {
          "subscription_id": subscription[0].id
        },
        [Modules.CUSTOMER]: {
          "customer_id": customer_id
        }
      })
    }

    return new StepResponse({
      subscription: subscription[0],
      linkDefs
    }, {
      subscription: subscription[0]
    })
  }, async ({ subscription }, { container }) => {
    const subscriptionModuleService: SubscriptionModuleService = 
      container.resolve(SUBSCRIPTION_MODULE)

    await subscriptionModuleService.cancelSubscriptions(subscription.id)
  }
)

export default createSubscriptionStep