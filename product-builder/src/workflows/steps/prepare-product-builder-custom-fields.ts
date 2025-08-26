import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_BUILDER_MODULE } from "../../modules/product-builder"

export type PrepareProductBuilderCustomFieldsStepInput = {
  product_builder_id: string
  custom_fields?: Array<{
    id?: string
    name: string
    type: string
    is_required?: boolean
    description?: string | null
  }>
}

export const prepareProductBuilderCustomFieldsStep = createStep(
  "prepare-product-builder-custom-fields",
  async (input: PrepareProductBuilderCustomFieldsStepInput, { container }) => {
    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)

    // Get existing custom fields for this product builder
    const existingCustomFields = await productBuilderModuleService.listProductBuilderCustomFields({
      product_builder_id: input.product_builder_id
    })

    // Separate operations: create, update, and delete
    const toCreate: any[] = []
    const toUpdate: any[] = []

    // Process input fields to determine creates vs updates
    input.custom_fields?.forEach(fieldData => {
      const existingField = existingCustomFields.find(f => f.id === fieldData.id)
      if (fieldData.id && existingField) {
        // Update existing field
        toUpdate.push({
          id: fieldData.id,
          name: fieldData.name,
          type: fieldData.type,
          is_required: fieldData.is_required ?? false,
          description: fieldData.description ?? "",
        })
      } else {
        // Create new field
        toCreate.push({
          product_builder_id: input.product_builder_id,
          name: fieldData.name,
          type: fieldData.type,
          is_required: fieldData.is_required ?? false,
          description: fieldData.description ?? "",
        })
      }
    })

    // Find fields to delete (existing but not in input)
    const toDelete = existingCustomFields.filter(
      field => !input.custom_fields?.some(f => f.id === field.id)
    )

    return new StepResponse({
      toCreate,
      toUpdate,
      toDelete
    })
  }
)
