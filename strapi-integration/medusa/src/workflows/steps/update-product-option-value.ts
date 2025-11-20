import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { IProductModuleService } from "@medusajs/framework/types"

type UpdateProductOptionValueInput = {
  id: string
  value: string
}

export const updateProductOptionValueStep = createStep(
  "update-product-option-value",
  async ({ id, value }: UpdateProductOptionValueInput, { container }) => {
    const productModuleService: IProductModuleService = container.resolve(Modules.PRODUCT)

    // Store the old value for compensation
    const oldOptionValue = await productModuleService.retrieveProductOptionValue(id)

    // Update the option value
    const updatedOptionValue = await productModuleService.updateProductOptionValues(
      id,
      {
        value,
      }
    )

    return new StepResponse(updatedOptionValue, oldOptionValue)
  },
  async (compensateData, { container }) => {
    if (!compensateData) {
      return
    }

    const productModuleService: IProductModuleService = container.resolve(Modules.PRODUCT)

    // Revert the option value to its old value
    await productModuleService.updateProductOptionValues(
      compensateData.id,
      {
        value: compensateData.value,
      }
    )
  }
)

