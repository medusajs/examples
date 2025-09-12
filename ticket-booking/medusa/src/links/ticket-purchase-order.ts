import TicketingModule from "../modules/ticket-booking"
import OrderModule from "@medusajs/medusa/order"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  {
    linkable: TicketingModule.linkable.ticketPurchase,
    deleteCascade: true,
    isList: true,
  },
  OrderModule.linkable.order
)
