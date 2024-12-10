import { getVariantAvailability, MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

type ValidateVariantOutOfStockStepInput = {
  variant_id: string
  sales_channel_id: string
}

export const validateVariantOutOfStockStep = createStep(
  "validate-variant-out-of-stock",
  async ({ variant_id, sales_channel_id }: ValidateVariantOutOfStockStepInput, { container }) => {
    const query = container.resolve("query")
    const availability = await getVariantAvailability(query, {
      variant_ids: [variant_id],
      sales_channel_id
    })
    
    if (availability[variant_id].availability > 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Variant isn't out of stock."
      )
    }
  }
)