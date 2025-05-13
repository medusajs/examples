import { defineLink } from "@medusajs/framework/utils"
import QuoteModule from "../modules/quote"
import OrderModule from "@medusajs/medusa/order"

export default defineLink(
  {
    linkable: QuoteModule.linkable.quote.id,
    field: "draft_order_id"
  },
  {
    linkable: OrderModule.linkable.order.id,
    alias: "draft_order",
  },
  {
    readOnly: true
  }
)