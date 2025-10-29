import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { RENTAL_MODULE } from "../../modules/rental"
import RentalModuleService from "../../modules/rental/service"
import { InferTypeOf, ProductVariantDTO } from "@medusajs/framework/types"
import { RentalConfiguration } from "../../modules/rental/models/rental-configuration"
import hasCartOverlap from "../../utils/has-cart-overlap"

export type ValidateRentalCartItemInput = {
  variant: ProductVariantDTO
  quantity: number
  metadata?: Record<string, unknown>
  rental_configuration: InferTypeOf<typeof RentalConfiguration> | null
  existing_cart_items: {
    id: string
    variant_id: string
    metadata?: Record<string, unknown>
  }[]
}

export const validateRentalCartItemStep = createStep(
  "validate-rental-cart-item",
  async ({ 
    variant, 
    quantity, 
    metadata, 
    rental_configuration, 
    existing_cart_items
  }: ValidateRentalCartItemInput, { container }) => {
    const rentalModuleService: RentalModuleService = container.resolve(RENTAL_MODULE)

    // Skip validation if not a rental product or if rental config is not active
    if (!rental_configuration || rental_configuration.status !== "active") {
      return new StepResponse({ is_rental: false, rental_days: 0, price: 0 })
    }

    // This is a rental product - validate quantity
    if (quantity !== 1) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Rental items must have a quantity of 1. Cannot add ${quantity} of variant ${variant.id}`
      )
    }

    // Validate metadata
    const rentalStartDate = metadata?.rental_start_date
    const rentalEndDate = metadata?.rental_end_date
    const rentalDays = metadata?.rental_days

    if (!rentalStartDate || !rentalEndDate || !rentalDays) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Rental product variant ${variant.id} requires rental_start_date, rental_end_date and rental_days in metadata`
      )
    }

    // Validate rental period meets configuration requirements
    const days = Number(rentalDays)
    if (days < rental_configuration.min_rental_days) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Rental period of ${days} days is less than the minimum of ${rental_configuration.min_rental_days} days`
      )
    }

    if (rental_configuration.max_rental_days !== null && days > rental_configuration.max_rental_days) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Rental period of ${days} days exceeds the maximum of ${rental_configuration.max_rental_days} days`
      )
    }

    const startDate = new Date(rentalStartDate as string)
    const endDate = new Date(rentalEndDate as string)

    // validate that the dates aren't in the past
    const now = new Date()
    if (startDate < now || endDate < now) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Rental dates cannot be in the past. Received start date: ${startDate.toISOString()}, end date: ${endDate.toISOString()}`
      )
    }

    if (endDate <= startDate) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `rental_end_date must be after rental_start_date for variant ${variant.id}`
      )
    }

    // Check if this rental variant is already in the cart with overlapping dates
    const hasCartOverlapResult = hasCartOverlap(
      {
        variant_id: variant.id,
        rental_start_date: startDate,
        rental_end_date: endDate,
        rental_days: days,
      },
      existing_cart_items
    )

    if (hasCartOverlapResult) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Rental variant ${variant.id} is already in the cart with overlapping dates (${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]})`
      )
    }

    // Check availability for the requested period
    const hasOverlap = await rentalModuleService.hasRentalOverlap(variant.id, startDate, endDate)
    
    if (hasOverlap) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Variant ${variant.id} is already rented during the requested period (${startDate.toISOString()} to ${endDate.toISOString()})`
      )
    }

    return new StepResponse({ 
      is_rental: true,
      rental_days: days,
      price: ((variant as any).calculated_price?.calculated_amount || 0) * days
    })
  }
)

