import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import AvalaraTaxModuleProvider from "../../modules/avalara/service"

type StepInput = {
  item: {
    medusaId: string
    itemCode: string
    description: string
    [key: string]: unknown
  }
}

export const createItemStep = createStep(
  "create-item",
  async ({ item }: StepInput, { container }) => {
    const taxModuleService = container.resolve("tax")
    const avalaraProviderService = taxModuleService.getProvider(
      `tp_${AvalaraTaxModuleProvider.identifier}_avalara`
    ) as AvalaraTaxModuleProvider

    const response = await avalaraProviderService.createItems(
      [item]
    )

    return new StepResponse(response[0], response[0].id)
  },
  async (data, { container }) => {
    if (!data) {
      return
    }
    const taxModuleService = container.resolve("tax")
    const avalaraProviderService = taxModuleService.getProvider(
      `tp_${AvalaraTaxModuleProvider.identifier}_avalara`
    ) as AvalaraTaxModuleProvider

    avalaraProviderService.deleteItem(data)
  }
)