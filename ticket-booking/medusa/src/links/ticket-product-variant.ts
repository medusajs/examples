import TicketingModule from "../modules/ticket-booking"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  {
    linkable: TicketingModule.linkable.ticketProductVariant,
    deleteCascade: true,
  },
  ProductModule.linkable.productVariant
)
