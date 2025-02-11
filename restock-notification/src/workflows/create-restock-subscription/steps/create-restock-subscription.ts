import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import RestockModuleService from "../../../modules/restock/service"
import { RESTOCK_MODULE } from "../../../modules/restock"

type CreateRestockSubscriptionStepInput = {
  variant_id: string
  sales_channel_id: string
  email: string
  customer_id?: string
}

export const createRestockSubscriptionStep = createStep(
  "create-restock-subscription",
  async (input: CreateRestockSubscriptionStepInput, { container }) => {
    const restockModuleService: RestockModuleService = container.resolve(
      RESTOCK_MODULE
    )

    const restockSubscription = await restockModuleService.createRestockSubscriptions(
      input
    )

    return new StepResponse(restockSubscription, restockSubscription)
  },
  async (restockSubscription, { container }) => {
    if (!restockSubscription) {
      return
    }
    const restockModuleService: RestockModuleService = container.resolve(
      RESTOCK_MODULE
    )

    await restockModuleService.deleteRestockSubscriptions(restockSubscription.id)
  }
)