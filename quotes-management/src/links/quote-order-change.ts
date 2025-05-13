import { defineLink } from "@medusajs/framework/utils"
import QuoteModule from "../modules/quote"
import OrderModule from "@medusajs/medusa/order"

export default defineLink(
  {
    linkable: QuoteModule.linkable.quote.id,
    field: "order_change_id"
  },
  OrderModule.linkable.orderChange,
  {
    readOnly: true
  }
)