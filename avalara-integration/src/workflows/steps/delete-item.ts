import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import AvalaraTaxModuleProvider from "../../modules/avalara/service"

type StepInput = {
  item_id: number
}

export const deleteItemStep = createStep(
  "delete-item",
  async ({ item_id }: StepInput, { container }) => {
    const taxModuleService = container.resolve("tax")
    const avalaraProviderService = taxModuleService.getProvider(
      `tp_${AvalaraTaxModuleProvider.identifier}_avalara`
    ) as AvalaraTaxModuleProvider

    try {
      // Retrieve original item before deleting
      const original = await avalaraProviderService.getItem(item_id)
      // Delete the item
      const response = await avalaraProviderService.deleteItem(original.id)

      return new StepResponse(response, {
        originalItem: original
      })
    } catch (error) {
      console.error(error)
      // Item does not exist in Avalara, so we can skip deletion
      return new StepResponse(void 0)
    }
  },
  async (data, { container }) => {
    if (!data) {
      return
    }

    const taxModuleService = container.resolve("tax")
    const avalaraProviderService = taxModuleService.getProvider(
      `tp_${AvalaraTaxModuleProvider.identifier}_avalara`
    ) as AvalaraTaxModuleProvider

    await avalaraProviderService.createItems(
      [{
        medusaId: data.originalItem.sourceEntityId ?? "",
        sku: data.originalItem.itemCode ?? "",
        title: data.originalItem.description,
        upc: data.originalItem.upc,
      }]
    )
  },
)

