import { defineLink } from "@medusajs/framework/utils"
import SubscriptionModule from "../modules/subscription"
import CustomerModule from "@medusajs/medusa/customer"

export default defineLink(
  {
    linkable: SubscriptionModule.linkable.subscription,
    isList: true
  },
  CustomerModule.linkable.customer
)