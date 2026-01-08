import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type CreateOptionsInStrapiInput = {
  options: {
    id: string
    title: string
  }[]
}

export const createOptionsInStrapiStep = createStep(
  "create-options-in-strapi",
  async ({ options }: CreateOptionsInStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    const results: Record<string, any>[] = []

    try {
      for (const option of options) {
        const strapiOption = await strapiService.create(Collection.PRODUCT_OPTIONS, {
          medusaId: option.id,
          title: option.title,
        })

        results.push(strapiOption.data)
      }
    } catch (error) {
      // If error occurs during loop, pass results created so far to compensation
      return StepResponse.permanentFailure(
        strapiService.formatStrapiError(error, 'Failed to create options in Strapi'),
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

    // Delete all created options
    for (const result of compensationData) {
      await strapiService.delete(Collection.PRODUCT_OPTIONS, result.documentId)
    }
  }
)

