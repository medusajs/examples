import { promiseAll } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { InferTypeOf } from "@medusajs/framework/types"
import RestockSubscription from "../../../modules/restock/models/restock-subscription"
import { isVariantInStock } from "../../utils/is-variant-in-stock"

type GetRestockedStepInput = InferTypeOf<typeof RestockSubscription>[]

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