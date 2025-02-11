import { defineLink } from "@medusajs/framework/utils"
import WishlistModule from "../modules/wishlist"
import CustomerModule from "@medusajs/medusa/customer"

export default defineLink(
  {
    ...WishlistModule.linkable.wishlist.id,
    field: "customer_id"
  },
  CustomerModule.linkable.customer.id,
  {
    readOnly: true
  }
)