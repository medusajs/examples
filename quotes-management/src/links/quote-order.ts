import { defineLink } from "@medusajs/framework/utils"
import QuoteModule from "../modules/quote"
import OrderModule from "@medusajs/medusa/order"

export default defineLink(
  {
    ...QuoteModule.linkable.quote,
    field: "draft_order_id"
  },
  {
    ...OrderModule.linkable.order.id,
    alias: "draft_order",
  },
  {
    readOnly: true
  }
)