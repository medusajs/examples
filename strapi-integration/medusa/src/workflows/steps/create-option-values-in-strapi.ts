import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type CreateOptionValuesInStrapiInput = {
  optionValues: {
    id: string
    value: string
    strapiOptionId: number
  }[]
}

export const createOptionValuesInStrapiStep = createStep(
  "create-option-values-in-strapi",
  async ({ optionValues }: CreateOptionValuesInStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    const results: Record<string, any>[] = []

    try {
      // Process all option values
      for (const optionValue of optionValues) {
        // Create option value in Strapi
        const strapiOptionValue = await strapiService.create(Collection.PRODUCT_OPTION_VALUES, {
          medusaId: optionValue.id,
          value: optionValue.value,
          option: optionValue.strapiOptionId,
        })

        results.push(strapiOptionValue.data)
      }
    } catch (error) {
      // If error occurs during loop, pass results created so far to compensation
      return StepResponse.permanentFailure(
        strapiService.formatStrapiError(error, 'Failed to create option values in Strapi'),
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
    
    // Delete all created option values
    for (const result of compensationData) {
      await strapiService.delete(Collection.PRODUCT_OPTION_VALUES, result.documentId)
    }
  }
)

