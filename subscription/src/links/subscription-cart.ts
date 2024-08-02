import { defineLink } from "@medusajs/utils"
import SubscriptionModule from "../modules/subscription"
import CartModule from "@medusajs/cart"

export default defineLink(
  SubscriptionModule.linkable.subscription,
  CartModule.linkable.cart
)