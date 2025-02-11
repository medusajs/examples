import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import RestockModuleService from "../../../modules/restock/service"
import { RESTOCK_MODULE } from "../../../modules/restock"

type UpdateRestockSubscriptionStepInput = {
  id: string
  customer_id?: string
}

export const updateRestockSubscriptionStep = createStep(
  "update-restock-subscription",
  async ({ id, customer_id }: UpdateRestockSubscriptionStepInput, { container }) => {
    const restockModuleService: RestockModuleService = container.resolve(
      RESTOCK_MODULE
    )

    const oldData = await restockModuleService.retrieveRestockSubscription(
      id
    )
    const restockSubscription = await restockModuleService.updateRestockSubscriptions({
      id,
      customer_id: oldData.customer_id || customer_id
    })

    return new StepResponse(restockSubscription, oldData)
  },
  async (restockSubscription, { container }) => {
    if (!restockSubscription) {
      return
    }
    const restockModuleService: RestockModuleService = container.resolve(
      RESTOCK_MODULE
    )

    await restockModuleService.updateRestockSubscriptions(restockSubscription)
  }
)