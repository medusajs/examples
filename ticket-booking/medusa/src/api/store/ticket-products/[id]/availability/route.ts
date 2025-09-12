import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const query = req.scope.resolve("query")

  const { data: [ticketProduct] } = await query.graph({
    entity: "ticket_product",
    fields: [
      "id",
      "product_id",
      "dates",
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

  console.log(ticketProduct)

  // Calculate availability for each date and row type
  const availability = ticketProduct.dates.map((date: string) => {
    // Group rows by row_type to get total seats per row type
    const rowTypeGroups = ticketProduct.venue.rows.reduce((groups: any, row: any) => {
      if (!groups[row.row_type]) {
        groups[row.row_type] = {
          row_type: row.row_type,
          total_seats: 0,
          rows: []
        }
      }
      groups[row.row_type].total_seats += row.seat_count
      groups[row.row_type].rows.push(row)
      return groups
    }, {})

    const dateAvailability = {
      date,
      row_types: Object.values(rowTypeGroups).map((group: any) => {
        // Find the variant for this date and row type
        const variant = ticketProduct.variants.find((v: any) => {
          const variantDate = v.product_variant.options.find((opt: any) => 
            opt.option?.title === "Date"
          )?.value
          const variantRowType = v.product_variant.options.find((opt: any) => 
            opt.option?.title === "Row Type"
          )?.value
          
          return variantDate === date && variantRowType === group.row_type
        })

        if (!variant) {
          return {
            row_type: group.row_type,
            total_seats: group.totalSeats,
            available_seats: 0,
            soldOut: true
          }
        }

        // Count purchased seats for this variant
        const purchasedSeats = variant.product_variant?.ticket_product_variant?.purchases?.length || 0
        const availableSeats = Math.max(0, group.total_seats - purchasedSeats)
        const soldOut = availableSeats === 0

        return {
          row_type: group.row_type,
          total_seats: group.total_seats,
          available_seats: availableSeats,
          sold_out: soldOut
        }
      })
    }

    // Check if the entire date is sold out
    const totalAvailableSeats = dateAvailability.row_types.reduce(
      (sum, rowType) => sum + rowType.available_seats, 0
    )
    const dateSoldOut = totalAvailableSeats === 0

    return {
      ...dateAvailability,
      sold_out: dateSoldOut
    }
  })

  return res.json({
    ticket_product: ticketProduct,
    availability
  })
}
