import { promiseAll } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { isVariantInStock } from "../../utils/is-variant-in-stock"

type GetRestockedStepInput = {
  variant_id: string
  sales_channel_id: string
}[]

export const getRestockedStep = createStep(
  "get-restocked",
  async (input: GetRestockedStepInput, stepContext) => {
    const restocked: GetRestockedStepInput = []
    
    await promiseAll(
      input.map(async (restockSubscription) => {
        const isInStock = await isVariantInStock({
          variant_id: restockSubscription.variant_id,
          sales_channel_id: restockSubscription.sales_channel_id
        }, stepContext)

        if (isInStock) {
          restocked.push(restockSubscription)
        }
      })
    )

    return new StepResponse(restocked)
  }
)