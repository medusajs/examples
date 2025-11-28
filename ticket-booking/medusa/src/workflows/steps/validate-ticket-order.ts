import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { cancelOrderWorkflow } from "@medusajs/medusa/core-flows"

export type ValidateTicketOrderStepInput = {
  items: {
    id: string
    variant_id: string
    metadata: Record<string, unknown>
    quantity: number
    variant?: {
      id: string
      product_id: string
      ticket_product_variant?: {
        purchases?: {
          seat_number: string
          show_date: Date
        }[]
      }
    }
  }[]
  order_id: string
}

export const validateTicketOrderStep = createStep(
  "validate-ticket-order",
  async ({ items, order_id }: ValidateTicketOrderStepInput, { container }) => {
    // Check for duplicate seats within the cart
    const seatDateCombinations = new Set<string>()
    
    for (const item of items) {
      if (item.quantity !== 1) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA, 
          "You can only purchase one ticket for a seat."
        )
      }

      if (!item.variant || !item.metadata?.seat_number) continue

      if (!item.metadata?.show_date) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA, 
          `Show date is required for seat ${item.metadata?.seat_number} in product ${item.variant.product_id}`
        )
      }

      // Create a unique key for seat and date combination
      const seatDateKey = `${item.metadata?.seat_number}-${item.metadata?.show_date}`
      
      // Check if this seat-date combination already exists in the cart
      if (seatDateCombinations.has(seatDateKey)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA, 
          `Duplicate seat ${item.metadata?.seat_number} found for show date ${item.metadata?.show_date} in cart`
        )
      }
      
      // Add to the set to track this combination
      seatDateCombinations.add(seatDateKey)

      // Check if seat has already been purchased
      const existingPurchase = item.variant.ticket_product_variant?.purchases?.find(
        (purchase) => purchase?.seat_number === item.metadata?.seat_number 
          && purchase?.show_date === item.metadata?.show_date
      )

      if (existingPurchase) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA, 
          `Seat ${item.metadata?.seat_number} has already been purchased for show date ${item.metadata?.show_date}`
        )
      }
    }

    return new StepResponse({ validated: true }, order_id)
  },
  async (order_id, { container, context }) => {
    if (!order_id) return

    cancelOrderWorkflow(container).run({
      input: {
        order_id,
      },
      context,
      container,
    })
  }
)