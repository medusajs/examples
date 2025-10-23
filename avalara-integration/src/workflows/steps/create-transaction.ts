import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import AvalaraTaxModuleProvider from "../../modules/avalara/service"
import { DocumentType } from "avatax/lib/enums/DocumentType"

type StepInput = {
  lines: {
    number: string
    quantity: number
    amount: number
    taxCode: string
    itemCode?: string
  }[]
  date: Date
  customerCode: string
  addresses: {
    singleLocation: {
      line1: string
      line2: string
      city: string
      region: string
      postalCode: string
      country: string
    }
  }
  currencyCode: string
  type: DocumentType
}

export const createTransactionStep = createStep(
  "create-transaction",
  async (input: StepInput, { container }) => {
    const taxModuleService = container.resolve("tax")
    const avalaraProviderService = taxModuleService.getProvider(
      `tp_${AvalaraTaxModuleProvider.identifier}_avalara`
    ) as AvalaraTaxModuleProvider

    const response = await avalaraProviderService.createTransaction(input)

    return new StepResponse(response, response)
  },
  async (data, { container }) => {
    if (!data?.code) {
      return
    }
    const taxModuleService = container.resolve("tax")
    const avalaraProviderService = taxModuleService.getProvider(
      `tp_${AvalaraTaxModuleProvider.identifier}_avalara`
    ) as AvalaraTaxModuleProvider

    await avalaraProviderService.uncommitTransaction(data.code)
  }
)