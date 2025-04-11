import { PromotionDTO, CustomerDTO } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import LoyaltyModuleService from "../../modules/loyalty/service"
import { LOYALTY_MODULE } from "../../modules/loyalty"

export type GetCartLoyaltyPromoAmountStepInput = {
  cart: {
    id: string
    customer: CustomerDTO
    promotions?: PromotionDTO[]
    total: number
  }
}

export const getCartLoyaltyPromoAmountStep = createStep(
  "get-cart-loyalty-promo-amount",
  async ({ cart }: GetCartLoyaltyPromoAmountStepInput, { container }) => {
    // Check if customer has any loyalty points
    const loyaltyModuleService: LoyaltyModuleService = container.resolve(
      LOYALTY_MODULE
    )
    const loyaltyPoints = await loyaltyModuleService.getPoints(
      cart.customer.id
    )

    if (loyaltyPoints <= 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Customer has no loyalty points"
      )
    }
    
    const pointsAmount = await loyaltyModuleService.calculatePointsFromAmount(
      loyaltyPoints
    )

    const amount = Math.min(pointsAmount, cart.total)

    return new StepResponse(amount)
  }
)

