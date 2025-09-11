import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { TICKET_BOOKING_MODULE } from "../../modules/ticket-booking"

export type UpdateTicketPurchaseStatusStepInput = {
  ticket_purchase_id: string
  status: "pending" | "scanned"
}

export const updateTicketPurchaseStatusStep = createStep(
  "update-ticket-purchase-status",
  async (input: UpdateTicketPurchaseStatusStepInput, { container }) => {
    const ticketBookingService = container.resolve(TICKET_BOOKING_MODULE)
    
    const currentTicket = await ticketBookingService.retrieveTicketPurchase(input.ticket_purchase_id)
    
    const updatedTicket = await ticketBookingService.updateTicketPurchases({
      id: input.ticket_purchase_id,
      status: input.status
    })

    return new StepResponse(updatedTicket, {
      id: input.ticket_purchase_id,
      previousStatus: currentTicket.status
    })
  },
  async (compensationData, { container }) => {
    if (!compensationData) return
    
    const ticketBookingService = container.resolve(TICKET_BOOKING_MODULE)
    await ticketBookingService.updateTicketPurchases({
      id: compensationData.id,
      status: compensationData.previousStatus
    })
  }
)
