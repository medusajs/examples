import { promiseAll } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { InferTypeOf } from "@medusajs/framework/types"
import RestockSubscription from "../../../modules/restock/models/restock-subscription"
import { hasOutOfStockLocations } from "../../utils/has-out-of-stock-locations"

type GetRestockedStepInput = InferTypeOf<typeof RestockSubscription>[]

export const getRestockedStep = createStep(
  "get-restocked",
  async (input: GetRestockedStepInput, { container }) => {
    const restocked: GetRestockedStepInput = []
    
    await promiseAll(
      input.map(async (restockSubscription) => {
        const isOutOfStock = await hasOutOfStockLocations({
          variant_id: restockSubscription.variant_id,
          sales_channel_ids: [restockSubscription.sales_channel_id]
        }, container)

        if (!isOutOfStock) {
          restocked.push(restockSubscription)
        }
      })
    )

    return new StepResponse(restocked)
  }
)