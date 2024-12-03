import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import RestockModuleService from "../../../modules/restock/service"
import { RESTOCK_MODULE } from "../../../modules/restock"

type CreateOrGetRestockSubscriptionsStepInput = {
  variant_id: string
  sales_channel_ids: string[]
}

export const createOrGetRestockSubscriptionsStep = createStep(
  "create-or-get-restock-subscriptions",
  async ({ 
    variant_id, sales_channel_ids
  }: CreateOrGetRestockSubscriptionsStepInput, { container }) => {
    const restockModuleService: RestockModuleService = container.resolve(RESTOCK_MODULE)

    const restockSubscriptions = await restockModuleService.listRestockSubscriptions({
      variant_id,
      sales_channel_id: sales_channel_ids
    })

    const toCreate = sales_channel_ids.filter(
      (salesChannelId) => !restockSubscriptions.some((rs) => rs.sales_channel_id === salesChannelId)
    ).map((salesChannelId) => ({
      variant_id,
      sales_channel_id: salesChannelId
    }))
    const created = await restockModuleService.createRestockSubscriptions(toCreate)

    restockSubscriptions.push(...created)

    return new StepResponse(restockSubscriptions, created)
  },
  async (createdRestockSubscriptions, { container }) => {
    if (!createdRestockSubscriptions?.length) {
      return
    }
    const restockModuleService: RestockModuleService = container.resolve(RESTOCK_MODULE)

    await restockModuleService.deleteRestockSubscriptions(
      createdRestockSubscriptions.map((subscription) => subscription.id)
    )
  }
)