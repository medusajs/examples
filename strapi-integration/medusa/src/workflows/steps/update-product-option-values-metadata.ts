import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { ProductOptionValueDTO } from "@medusajs/framework/types"

export type UpdateProductOptionValuesMetadataInput = {
  updates: {
    id: string
    strapiId: number
    strapiDocumentId: string
  }[]
}

export const updateProductOptionValuesMetadataStep = createStep(
  "update-product-option-values-metadata",
  async ({ updates }: UpdateProductOptionValuesMetadataInput, { container }) => {
    const productModuleService = container.resolve(Modules.PRODUCT)

    const updatedOptionValues: ProductOptionValueDTO[] = []

    // Fetch original metadata for compensation
    const originalOptionValues = await productModuleService.listProductOptionValues({ 
      id: updates.map((u) => u.id)
    })

    // Update each option value's metadata
    for (const update of updates) {
      const optionValue = originalOptionValues.find((ov) => ov.id === update.id)
      if (optionValue) {

        const updated = await productModuleService.updateProductOptionValues(update.id, {
          metadata: {
            ...optionValue.metadata,
            strapi_id: update.strapiId,
            strapi_document_id: update.strapiDocumentId,
          },
        })

        updatedOptionValues.push(updated)

      }
    }

    return new StepResponse(updatedOptionValues, originalOptionValues)
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const productModuleService = container.resolve(Modules.PRODUCT)

    // Restore original metadata
    for (const original of compensationData) {
      await productModuleService.updateProductOptionValues(original.id, {
        metadata: original.metadata,
      })
    }
  }
)

