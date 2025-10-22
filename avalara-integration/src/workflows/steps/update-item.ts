import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import AvalaraTaxModuleProvider from "../../modules/avalara/service"

type StepInput = {
  item: {
    id: number
    medusaId: string
    itemCode: string
    description: string
    [key: string]: unknown
  }
}

export const updateItemStep = createStep(
  "update-item",
  async ({ item }: StepInput, { container }) => {
    const taxModuleService = container.resolve("tax")
    const avalaraProviderService = taxModuleService.getProvider(
      `tp_${AvalaraTaxModuleProvider.identifier}_avalara`
    ) as AvalaraTaxModuleProvider

    // Retrieve original item before updating
    const originalItem = await avalaraProviderService.getItem(item.id)

    // Update the item
    const response = await avalaraProviderService.updateItem(item)

    return new StepResponse(response, {
      originalItem
    })
  },
  async (data, { container }) => {
    if (!data) {
      return
    }

    const taxModuleService = container.resolve("tax")
    const avalaraProviderService = taxModuleService.getProvider(
      `tp_${AvalaraTaxModuleProvider.identifier}_avalara`
    ) as AvalaraTaxModuleProvider

    // Revert the updates by restoring original values
    await avalaraProviderService.updateItem({
      id: data.originalItem.id,
      itemCode: data.originalItem.itemCode,
      description: data.originalItem.description,
    })
  }
)

