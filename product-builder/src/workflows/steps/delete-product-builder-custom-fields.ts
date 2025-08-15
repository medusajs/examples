import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_BUILDER_MODULE } from "../../modules/product-builder"

export type DeleteProductBuilderCustomFieldsStepInput = {
  custom_fields: Array<{
    id: string
    product_builder_id: string
    name: string
    type: string
    is_required: boolean
    description?: string | null
  }>
}

export const deleteProductBuilderCustomFieldsStep = createStep(
  "delete-product-builder-custom-fields",
  async (input: DeleteProductBuilderCustomFieldsStepInput, { container }) => {
    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)
    
    await productBuilderModuleService.deleteProductBuilderCustomFields(
      input.custom_fields.map(f => f.id)
    )
    
    return new StepResponse(input.custom_fields, {
      deletedItems: input.custom_fields
    })
  },
  async (compensationData, { container }) => {
    if (!compensationData?.deletedItems?.length) {
      return
    }

    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)
    await productBuilderModuleService.createProductBuilderCustomFields(
      compensationData.deletedItems.map((f: any) => ({
        id: f.id,
        product_builder_id: f.product_builder_id,
        name: f.name,
        type: f.type,
        is_required: f.is_required,
        description: f.description,
      }))
    )
  }
)
