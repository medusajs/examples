import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type UpdateVariantInStrapiInput = {
  variant: {
    id: string
    title?: string
    sku?: string
    optionValueIds?: number[]
  }
}

export const updateVariantInStrapiStep = createStep(
  "update-variant-in-strapi",
  async ({ variant }: UpdateVariantInStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    const originalVariant = await strapiService.findByMedusaId(
      Collection.PRODUCT_VARIANTS, 
      variant.id, 
      ["option_values"]
    )

    // Update variant in Strapi
    const updated = await strapiService.update(Collection.PRODUCT_VARIANTS, originalVariant.documentId, {
      title: variant.title,
      sku: variant.sku,
      ...(variant.optionValueIds && { optionValueIds: variant.optionValueIds }),
    })

    return new StepResponse(
      updated.data,
      originalVariant
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)
    
    // Restore original variant data
    await strapiService.update(Collection.PRODUCT_VARIANTS, compensationData.documentId, {
      title: compensationData.title,
      sku: compensationData.sku,
      option_values: compensationData.option_values,
    })
  }
)

