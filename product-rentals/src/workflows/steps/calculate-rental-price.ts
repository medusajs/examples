import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export type CalculateRentalPriceInput = {
  variant_price: number
  rental_days: number
}

export const calculateRentalPriceStep = createStep(
  "calculate-rental-price",
  async ({ variant_price, rental_days }: CalculateRentalPriceInput) => {
    // Calculate total price = price per day * number of rental days
    const totalPrice = variant_price * rental_days

    return new StepResponse(totalPrice)
  }
)

