import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { TICKET_BOOKING_MODULE } from "../../modules/ticket-booking"
import { RowType } from "../../modules/ticket-booking/models/venue-row"

export type CreateTicketProductVariantsStepInput = {
  variants: {
    ticket_product_id: string
    product_variant_id: string
    row_type: RowType
  }[]
}

export const createTicketProductVariantsStep = createStep(
  "create-ticket-product-variants",
  async (input: CreateTicketProductVariantsStepInput, { container }) => {
    const ticketBookingModuleService = container.resolve(TICKET_BOOKING_MODULE)

    // Create ticket product variants for each Medusa variant
    const ticketVariants = await ticketBookingModuleService.createTicketProductVariants(
      input.variants
    )

    return new StepResponse(
      {
        ticket_product_variants: ticketVariants
      },
      {
        ticket_product_variants: ticketVariants
      },
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData?.ticket_product_variants) return

    const ticketBookingModuleService = container.resolve(TICKET_BOOKING_MODULE)
    
    await ticketBookingModuleService.deleteTicketProductVariants(
      compensationData.ticket_product_variants.map(v => v.id)
    )
  }
)
