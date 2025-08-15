import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_BUILDER_MODULE } from "../../modules/product-builder"

export type UpdateProductBuilderCustomFieldsStepInput = {
  custom_fields: Array<{
    id: string
    name: string
    type: string
    is_required: boolean
    description?: string
  }>
}

export const updateProductBuilderCustomFieldsStep = createStep(
  "update-product-builder-custom-fields",
  async (input: UpdateProductBuilderCustomFieldsStepInput, { container }) => {
    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)
    
    // Store original state for compensation
    const originalFields = await productBuilderModuleService.listProductBuilderCustomFields({
      id: input.custom_fields.map(f => f.id)
    })
    
    const updatedFields = await productBuilderModuleService.updateProductBuilderCustomFields(
      input.custom_fields
    )
    
    return new StepResponse(updatedFields, {
      originalItems: originalFields
    })
  },
  async (compensationData, { container }) => {
    if (!compensationData?.originalItems?.length) {
      return
    }

    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)
    await productBuilderModuleService.updateProductBuilderCustomFields(
      compensationData.originalItems.map((f: any) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        is_required: f.is_required,
        description: f.description
      }))
    )
  }
)
