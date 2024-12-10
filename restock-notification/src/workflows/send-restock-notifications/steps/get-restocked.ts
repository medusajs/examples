import { getVariantAvailability, promiseAll } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

type GetRestockedStepInput = {
  variant_id: string
  sales_channel_id: string
}[]

export const getRestockedStep = createStep(
  "get-restocked",
  async (input: GetRestockedStepInput, { container }) => {
    const restocked: GetRestockedStepInput = []
    const query = container.resolve("query")
    
    await promiseAll(
      input.map(async (restockSubscription) => {
        const variantAvailability = await getVariantAvailability(query, {
          variant_ids: [restockSubscription.variant_id],
          sales_channel_id: restockSubscription.sales_channel_id
        })

        if (variantAvailability[restockSubscription.variant_id].availability > 0) {
          restocked.push(restockSubscription)
        }
      })
    )

    return new StepResponse(restocked)
  }
)