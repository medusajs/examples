import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { RENTAL_MODULE } from "../../modules/rental"
import RentalModuleService from "../../modules/rental/service"
import { InferTypeOf } from "@medusajs/framework/types"
import { RentalConfiguration } from "../../modules/rental/models/rental-configuration"
import hasCartOverlap from "../../utils/has-cart-overlap"
import validateRentalDates from "../../utils/validate-rental-dates"
import { cancelOrderWorkflow } from "@medusajs/medusa/core-flows"

export type ValidateRentalInput = {
  rental_items: {
    line_item_id: string
    variant_id: string
    quantity: number
    rental_configuration: InferTypeOf<typeof RentalConfiguration>
    rental_start_date: Date
    rental_end_date: Date
    rental_days: number
  }[]
  order_id: string
}

export const validateRentalStep = createStep(
  "validate-rental",
  async ({ rental_items, order_id }: ValidateRentalInput, { container }) => {
    const rentalModuleService: RentalModuleService = container.resolve(RENTAL_MODULE)

    for (let i = 0; i < rental_items.length; i++) {
      const rentalItem = rental_items[i]
      const { 
        line_item_id, 
        variant_id, 
        quantity, 
        rental_configuration, 
        rental_start_date, 
        rental_end_date, 
        rental_days
      } = rentalItem

      if (rental_configuration.status !== "active") {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Rental configuration for variant ${variant_id} is not active`
        )
      }

      // Validate quantity is 1 for rental items
      if (quantity !== 1) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Rental items must have a quantity of 1. Line item ${line_item_id} has quantity ${quantity}`
        )
      }

      // Validate metadata presence
      if (!rental_start_date || !rental_end_date || !rental_days) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Line item ${line_item_id} is for a rentable product but missing required metadata: rental_start_date, rental_end_date and/or rental_days`
        )
      }

      const startDate = rental_start_date instanceof Date ? rental_start_date : new Date(rental_start_date)
      const endDate = rental_end_date instanceof Date ? rental_end_date : new Date(rental_end_date)
      
      validateRentalDates(
        startDate, 
        endDate, 
        {
          min_rental_days: rental_configuration.min_rental_days,
          max_rental_days: rental_configuration.max_rental_days,
        }, 
        rental_days
      )

      const hasCartOverlapResult = hasCartOverlap(
        {
          variant_id,
          rental_start_date,
          rental_end_date,
          rental_days,
        },
        rental_items.slice(i + 1).map((item) => ({
          id: item.line_item_id,
          variant_id: item.variant_id,
          metadata: {
            rental_start_date: item.rental_start_date.toISOString(),
            rental_end_date: item.rental_end_date.toISOString(),
            rental_days: item.rental_days,
          }
        }))
      )

      if (hasCartOverlapResult) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Cannot have multiple rental items for variant ${variant_id} with overlapping dates in the cart`
        )
      }

      if (await rentalModuleService.hasRentalOverlap(variant_id, startDate, endDate)) {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          `Variant ${variant_id} is already rented during the requested period (${startDate.toISOString()} to ${endDate.toISOString()})`
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

