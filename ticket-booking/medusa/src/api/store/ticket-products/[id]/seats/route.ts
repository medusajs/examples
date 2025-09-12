import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

export const GetTicketProductSeatsSchema = z.object({
  date: z.string(),
})

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const { date } = req.validatedQuery
  const query = req.scope.resolve("query")

  const { data: [ticketProduct] } = await query.graph({
    entity: "ticket_product",
    fields: [
      "id",
      "product_id",
      "venue.*",
      "venue.rows.*",
      "variants.*",
      "variants.product_variant.*",
      "variants.product_variant.options.*",
      "variants.product_variant.options.option.*",
      "variants.product_variant.ticket_product_variant.*",
      "variants.product_variant.ticket_product_variant.purchases.*"
    ],
    filters: {
      product_id: id
    }
  })

  if (!ticketProduct) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Ticket product not found")
  }

  // Build seat map for the specified date
  const seatMap = ticketProduct.venue.rows.map((row: any) => {
    // Find the variant for this date and row type
    const variant = ticketProduct.variants.find((v: any) => {
      const variantDate = v.product_variant.options.find((opt: any) => 
        opt.option?.title === "Date"
      )?.value
      const variantRowType = v.product_variant.options.find((opt: any) => 
        opt.option?.title === "Row Type"
      )?.value
      
      return variantDate === date && variantRowType === row.row_type
    })

    // Get purchased seats for this variant
    const purchasedSeats = variant?.product_variant?.ticket_product_variant?.purchases?.map(
      (purchase) => purchase?.seat_number
    ).filter(Boolean) || []

    // Generate seat numbers for this row
    const seats = Array.from({ length: row.seat_count }, (_, index) => {
      const seatNumber = (index + 1).toString()
      const isPurchased = purchasedSeats.includes(seatNumber)
      
      return {
        number: seatNumber,
        is_purchased: isPurchased,
        variant_id: variant?.product_variant?.id || null
      }
    })

    return {
      row_number: row.row_number,
      row_type: row.row_type,
      seats
    }
  })

  return res.json({
    venue: ticketProduct.venue,
    date,
    seat_map: seatMap
  })
}
