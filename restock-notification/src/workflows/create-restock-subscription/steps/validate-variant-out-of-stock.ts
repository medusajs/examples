import { deepFlatMap, MedusaError, promiseAll } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { hasOutOfStockLocations } from "../../utils/has-out-of-stock-locations"

type ValidateVariantOutOfStockStepInput = {
  variant_id: string
  sales_channel_ids: string[]
}

export const validateVariantOutOfStockStep = createStep(
  "validate-variant-out-of-stock",
  async (input: ValidateVariantOutOfStockStepInput, { container }) => {
    const isOutOfStock = await hasOutOfStockLocations(input, container)
    
    if (!isOutOfStock) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Specified variant is in stock."
      )
    }
  }
)