import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, QueryContext } from "@medusajs/framework/utils"
import { z } from "zod"
import { RENTAL_MODULE } from "../../../../../modules/rental"
import RentalModuleService from "../../../../../modules/rental/service"

export const GetRentalAvailabilitySchema = z.object({
  variant_id: z.string(),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "start_date must be a valid date string (YYYY-MM-DD)",
  }),
  end_date: z
    .string()
    .optional()
    .refine((val) => val === undefined || !isNaN(Date.parse(val)), {
      message: "end_date must be a valid date string (YYYY-MM-DD)",
    }),
  currency_code: z.string().optional(),
})

export const GET = async (
  req: MedusaRequest<{}, z.infer<typeof GetRentalAvailabilitySchema>>, 
  res: MedusaResponse
) => {
  
  const { id: productId } = req.params
 
  const { 
    variant_id, 
    start_date, 
    end_date,
    currency_code
  } = req.validatedQuery

  const query = req.scope.resolve("query")
  const rentalModuleService: RentalModuleService = req.scope.resolve(
    RENTAL_MODULE
  )

  // Parse dates
  const rentalStartDate = new Date(start_date)
  const rentalEndDate = end_date ? new Date(end_date) : new Date(rentalStartDate)
  
  // If no end_date provided, assume single day rental (same day)
  if (!end_date) {
    rentalEndDate.setHours(23, 59, 59, 999)
  }

  // Validate dates
  if (rentalEndDate < rentalStartDate) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "end_date must be greater than or equal to start_date"
    )
  }

  // Get active rental configuration for the product
  const { data: [rentalConfig] } = await query.graph({
    entity: "rental_configuration",
    fields: ["*"],
    filters: { 
      product_id: productId,
      status: "active",
    },
  })

  if (!rentalConfig) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "product is not rentable"
    )
  }

  // Calculate rental days
  const timeDiff = rentalEndDate.getTime() - rentalStartDate.getTime()
  const rentalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1

  // Validate rental period meets configuration requirements
  if (rentalDays < rentalConfig.min_rental_days) {
    return res.json({
      available: false,
      message: `Rental period of ${rentalDays} days is less than the minimum of ${rentalConfig.min_rental_days} days`
    })
  }

  if (rentalConfig.max_rental_days !== null && rentalDays > rentalConfig.max_rental_days) {
    return res.json({
      available: false,
      message: `Rental period of ${rentalDays} days exceeds the maximum of ${rentalConfig.max_rental_days} days`
    })
  }

  // Check if variant is already rented during the requested period
  const isAvailable = !await rentalModuleService.hasRentalOverlap(
    variant_id, 
    rentalStartDate, 
    rentalEndDate
  )
  let price = 0
  if (isAvailable && currency_code) {
    const { data: [variant] } = await query.graph({
      entity: "product_variant",
      fields: ["calculated_price.*"],
      filters: {
        id: variant_id,
      },
      context: {
        calculated_price: QueryContext({
          currency_code: currency_code,
        }),
      },
    })
    price = ((variant as any).calculated_price?.calculated_amount || 0) *
      rentalDays
  }

  res.json({
    available: isAvailable,
    price: {
      amount: price,
      currency_code: currency_code,
    }
  })
}

