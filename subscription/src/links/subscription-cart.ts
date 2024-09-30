import { defineLink } from "@medusajs/framework/utils"
import SubscriptionModule from "../modules/subscription"
import CartModule from "@medusajs/medusa/cart"

export default defineLink(
  SubscriptionModule.linkable.subscription,
  CartModule.linkable.cart
)