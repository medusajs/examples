import { defineLink } from "@medusajs/utils"
import SubscriptionModule from "../modules/subscription"
import CustomerModule from "@medusajs/customer"

export default defineLink(
  {
    linkable: SubscriptionModule.linkable.subscription,
    isList: true
  },
  CustomerModule.linkable.customer
)