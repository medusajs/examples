import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { LOYALTY_MODULE } from "../../modules/loyalty"
import LoyaltyModuleService from "../../modules/loyalty/service"

type StepInput = {
  customer_id: string
  amount: number
}

export const addPurchaseAsPointsStep = createStep(
  "add-purchase-as-points",
  async (input: StepInput, { container }) => {
    const loyaltyModuleService: LoyaltyModuleService = container.resolve(
      LOYALTY_MODULE
    )

    const pointsToAdd = await loyaltyModuleService.calculatePointsFromAmount(
      input.amount
    )

    const result = await loyaltyModuleService.addPoints(
      input.customer_id,
      pointsToAdd
    )

    return new StepResponse(result, {
      customer_id: input.customer_id,
      points: pointsToAdd
    })
  },
  async (data, { container }) => {
    if (!data) {
      return
    }

    const loyaltyModuleService: LoyaltyModuleService = container.resolve(
      LOYALTY_MODULE
    )

    await loyaltyModuleService.deductPoints(
      data.customer_id,
      data.points
    )
  }
)

