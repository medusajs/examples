import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { ProductVariantDTO } from "@medusajs/framework/types"

export type UpdateProductVariantsMetadataInput = {
  updates: {
    variantId: string
    strapiId: number
    strapiDocumentId: string
  }[]
}

export const updateProductVariantsMetadataStep = createStep(
  "update-product-variants-metadata",
  async ({ updates }: UpdateProductVariantsMetadataInput, { container }) => {
    const productModuleService = container.resolve(Modules.PRODUCT)

    const updatedVariants: ProductVariantDTO[] = []

    // Fetch original metadata for compensation
    const originalVariants = await productModuleService.listProductVariants({ 
      id: updates.map((u) => u.variantId)
    })

    // Update each variant's metadata
    for (const update of updates) {
      const variant = originalVariants.find((v) => v.id === update.variantId)
      if (variant) {

        const updated = await productModuleService.updateProductVariants(update.variantId, {
          metadata: {
            ...variant.metadata,
            strapi_id: update.strapiId,
            strapi_document_id: update.strapiDocumentId,
          },
        })

        updatedVariants.push(updated)

      }
    }

    return new StepResponse(updatedVariants, originalVariants)
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const productModuleService = container.resolve(Modules.PRODUCT)

    // Restore original metadata
    for (const original of compensationData) {
      await productModuleService.updateProductVariants(original.id, {
        metadata: original.metadata,
      })
    }
  }
)

