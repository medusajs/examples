import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { 
  CartDTO, 
  CartLineItemDTO, 
  ProductVariantDTO,
  InferTypeOf
} from "@medusajs/framework/types"
import { TICKET_BOOKING_MODULE } from "../../modules/ticket-booking"
import TicketProductVariant from "../../modules/ticket-booking/models/ticket-product-variant"

export type CreateTicketPurchasesStepInput = {
  order_id: string
  cart: CartDTO & {
    items: CartLineItemDTO & {
      variant?: ProductVariantDTO & {
        ticket_product_variant?: InferTypeOf<typeof TicketProductVariant>
      }
    }[]
  }
}

export const createTicketPurchasesStep = createStep(
  "create-ticket-purchases",
  async (input: CreateTicketPurchasesStepInput, { container }) => {
    const { order_id, cart } = input
    const ticketBookingModuleService = container.resolve(TICKET_BOOKING_MODULE)

    const ticketPurchasesToCreate: {
      order_id: string
      ticket_product_id: string
      ticket_variant_id: string
      venue_row_id: string
      seat_number: string
      show_date: Date
    }[] = []

    // Process each item in the cart
    for (const item of cart.items) {
      if (
        !item?.variant?.ticket_product_variant || 
        !item?.metadata?.venue_row_id || 
        !item?.metadata?.seat_number
      ) continue

      ticketPurchasesToCreate.push({
        order_id,
        ticket_product_id: item.variant.ticket_product_variant.ticket_product_id,
        ticket_variant_id: item.variant.ticket_product_variant.id,
        venue_row_id: item?.metadata.venue_row_id as string,
        seat_number: item?.metadata.seat_number as string,
        show_date: new Date(
          item?.variant.options.find(
            (option: any) => option.option.title === "Date"
          )?.value as string
        )
      })
    }

    const ticketPurchases = await ticketBookingModuleService.createTicketPurchases(
      ticketPurchasesToCreate
    )
    
    return new StepResponse(
      ticketPurchases,
      ticketPurchases
    )
  },
  async (ticketPurchases, { container }) => {
    if (!ticketPurchases) return

    const ticketBookingModuleService = container.resolve(TICKET_BOOKING_MODULE)

    // Delete the created ticket purchases
    await ticketBookingModuleService.deleteTicketPurchases(
      ticketPurchases.map((ticketPurchase) => ticketPurchase.id)
    )
  }
)
