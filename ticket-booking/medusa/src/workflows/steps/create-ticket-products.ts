import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { TICKET_BOOKING_MODULE } from "../../modules/ticket-booking"

export type CreateTicketProductsStepInput = {
  ticket_products: {
    product_id: string
    venue_id: string
    dates: string[]
  }[]
}

export const createTicketProductsStep = createStep(
  "create-ticket-products",
  async (input: CreateTicketProductsStepInput, { container }) => {
    const ticketBookingModuleService = container.resolve(TICKET_BOOKING_MODULE)

    // Create the main ticket product
    const ticketProducts = await ticketBookingModuleService.createTicketProducts(
      input.ticket_products
    )

    return new StepResponse(
      { 
        ticket_products: ticketProducts
      },
      { 
        ticket_products: ticketProducts
      },
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData?.ticket_products) return

    const ticketBookingModuleService = container.resolve(TICKET_BOOKING_MODULE)
    
    // Delete the ticket product
    await ticketBookingModuleService.deleteTicketProducts(
      compensationData.ticket_products.map(tp => tp.id)
    )
  }
)
