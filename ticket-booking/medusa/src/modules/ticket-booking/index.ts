import TicketBookingModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const TICKET_BOOKING_MODULE = "ticketBooking"

export default Module(TICKET_BOOKING_MODULE, {
  service: TicketBookingModuleService,
})