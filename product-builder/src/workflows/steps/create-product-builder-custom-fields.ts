import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_BUILDER_MODULE } from "../../modules/product-builder"

export type CreateProductBuilderCustomFieldsStepInput = {
  custom_fields: Array<{
    product_builder_id: string
    name: string
    type: string
    is_required: boolean
    description?: string
  }>
}

export const createProductBuilderCustomFieldsStep = createStep(
  "create-product-builder-custom-fields",
  async (input: CreateProductBuilderCustomFieldsStepInput, { container }) => {
    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)
    
    const createdFields = await productBuilderModuleService.createProductBuilderCustomFields(
      input.custom_fields
    )
    
    return new StepResponse(createdFields, {
      createdItems: createdFields
    })
  },
  async (compensationData, { container }) => {
    if (!compensationData?.createdItems?.length) {
      return
    }

    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)
    await productBuilderModuleService.deleteProductBuilderCustomFields(
      compensationData.createdItems.map((f: any) => f.id)
    )
  }
)
