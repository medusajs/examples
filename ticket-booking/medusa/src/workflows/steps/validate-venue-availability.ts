import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { TICKET_BOOKING_MODULE } from "../../modules/ticket-booking"
import { MedusaError } from "@medusajs/framework/utils"

export type ValidateVenueAvailabilityStepInput = {
  venue_id: string
  dates: string[]
}

export const validateVenueAvailabilityStep = createStep(
  "validate-venue-availability",
  async (input: ValidateVenueAvailabilityStepInput, { container }) => {
    const ticketBookingModuleService = container.resolve(TICKET_BOOKING_MODULE)

    // Get all existing ticket products for this venue
    const existingTicketProducts = await ticketBookingModuleService.listTicketProducts({
      venue_id: input.venue_id
    })

    const hasConflict = existingTicketProducts.some(ticketProduct => 
      ticketProduct.dates.some(date => input.dates.includes(date))
    )

    if (hasConflict) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA, 
        `Venue has conflicting shows on dates: ${input.dates.join(", ")}`
      )
    }

    return new StepResponse({ valid: true })
  },
)
