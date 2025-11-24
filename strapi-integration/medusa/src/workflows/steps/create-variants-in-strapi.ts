import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type CreateVariantsInStrapiInput = {
  variants: {
    id: string
    title: string
    sku?: string
    strapiProductId: number
    optionValueIds?: number[]
    imageIds?: number[]
    thumbnailId?: number
  }[]
}

export const createVariantsInStrapiStep = createStep(
  "create-variants-in-strapi",
  async ({ variants }: CreateVariantsInStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    const results: Record<string, any>[] = []

    try {
      // Process all variants
      for (const variant of variants) {
        // Create variant in Strapi
        const strapiVariant = await strapiService.create(Collection.PRODUCT_VARIANTS, {
          medusaId: variant.id,
          title: variant.title,
          sku: variant.sku,
          product: variant.strapiProductId,
          option_values: variant.optionValueIds || [],
          images: variant.imageIds || [],
          thumbnail: variant.thumbnailId,
        })

        results.push(strapiVariant.data)
      }
    } catch (error) {
      // If error occurs during loop, pass results created so far to compensation
      return StepResponse.permanentFailure(
        strapiService.formatStrapiError(error, 'Failed to create variants in Strapi'),
        { results }
      )
    }

    return new StepResponse(
      results,
      results
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)
    
    // Delete all created variants
    for (const result of compensationData) {
      await strapiService.delete(Collection.PRODUCT_VARIANTS, result.documentId)
    }
  }
)

