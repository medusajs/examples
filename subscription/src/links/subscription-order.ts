import { defineLink } from "@medusajs/framework/utils"
import SubscriptionModule from "../modules/subscription"
import OrderModule from "@medusajs/medusa/order"

export default defineLink(
  SubscriptionModule.linkable.subscription,
  {
    linkable: OrderModule.linkable.order,
    isList: true
  }
)