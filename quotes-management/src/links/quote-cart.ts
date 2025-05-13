import { defineLink } from "@medusajs/framework/utils"
import QuoteModule from "../modules/quote"
import CartModule from "@medusajs/medusa/cart"

export default defineLink(
  {
    linkable: QuoteModule.linkable.quote.id,
    field: "cart_id"
  },
  CartModule.linkable.cart,
  {
    readOnly: true
  }
)