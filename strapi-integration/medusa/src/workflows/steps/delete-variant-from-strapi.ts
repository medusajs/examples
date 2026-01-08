import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type DeleteVariantFromStrapiInput = {
  id: string
}

export const deleteVariantFromStrapiStep = createStep(
  "delete-variant-from-strapi",
  async ({ id }: DeleteVariantFromStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    // Find the Strapi variant
    const [strapiVariant] = await strapiService.findByMedusaId(
      Collection.PRODUCT_VARIANTS, 
      id, 
      ["option_values"]
    )

    // Delete variant from Strapi
    await strapiService.delete(Collection.PRODUCT_VARIANTS, strapiVariant.documentId)

    return new StepResponse(
      void 0,
      strapiVariant
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)
    
    // Recreate deleted variant
    await strapiService.create(Collection.PRODUCT_VARIANTS, {
      medusaId: compensationData.medusaId,
      title: compensationData.title,
      sku: compensationData.sku,
      product: compensationData.product,
      option_values: compensationData.option_values || [],
      images: compensationData.images || [],
      thumbnail: compensationData.thumbnail,
    })
  }
)

