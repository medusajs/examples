import { defineLink } from "@medusajs/framework/utils"
import QuoteModule from "../modules/quote"
import CustomerModule from "@medusajs/medusa/customer"

export default defineLink(
  {
    linkable: QuoteModule.linkable.quote.id,
    field: "customer_id"
  },
  CustomerModule.linkable.customer,
  {
    readOnly: true
  }
)