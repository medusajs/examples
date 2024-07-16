import { defineLink } from "@medusajs/utils"
import SubscriptionModule from "../modules/subscription"
import OrderModule from "@medusajs/order"

export default defineLink(
  SubscriptionModule.linkable.subscription,
  {
    linkable: OrderModule.linkable.order,
    isList: true
  }
)