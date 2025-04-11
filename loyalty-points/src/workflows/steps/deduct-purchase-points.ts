import { 
  createStep,
  StepResponse 
} from "@medusajs/framework/workflows-sdk"
import { LOYALTY_MODULE } from "../../modules/loyalty"
import LoyaltyModuleService from "../../modules/loyalty/service"

type DeductPurchasePointsInput = {
  customer_id: string
  amount: number
}

export const deductPurchasePointsStep = createStep(
  "deduct-purchase-points",
  async ({ 
    customer_id, amount
  }: DeductPurchasePointsInput, { container }) => {
    const loyaltyModuleService: LoyaltyModuleService = container.resolve(
      LOYALTY_MODULE
    )

    const pointsToDeduct = await loyaltyModuleService.calculatePointsFromAmount(
      amount
    )

    const result = await loyaltyModuleService.deductPoints(
      customer_id,
      pointsToDeduct
    )

    return new StepResponse(result, {
      customer_id,
      points: pointsToDeduct
    })
  },
  async (data, { container }) => {
    if (!data) {
      return
    }

    const loyaltyModuleService: LoyaltyModuleService = container.resolve(
      LOYALTY_MODULE
    )

    // Restore points in case of failure
    await loyaltyModuleService.addPoints(
      data.customer_id,
      data.points
    )
  }
)

