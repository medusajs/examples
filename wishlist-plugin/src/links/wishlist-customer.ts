import { defineLink } from "@medusajs/framework/utils"
import WishlistModule from "../modules/wishlist"
import CustomerModule from "@medusajs/medusa/customer"

export default defineLink(
  WishlistModule.linkable.wishlist,
  CustomerModule.linkable.customer
)