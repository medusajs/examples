import { MedusaError } from "@medusajs/framework/utils"
import { createStep } from "@medusajs/framework/workflows-sdk"
import { isVariantInStock } from "../../utils/is-variant-in-stock"

type ValidateVariantOutOfStockStepInput = {
  variant_id: string
  sales_channel_id: string
}

export const validateVariantOutOfStockStep = createStep(
  "validate-variant-out-of-stock",
  async (input: ValidateVariantOutOfStockStepInput, stepContext) => {
    const isInStock = await isVariantInStock(input, stepContext)

    if (isInStock) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Variant is in stock.`
      )
    }
  }
)