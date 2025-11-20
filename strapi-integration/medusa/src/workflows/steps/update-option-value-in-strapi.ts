import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type UpdateOptionValueInStrapiInput = {
  optionValues: {
    id: string
    value: string
  }[]
}

export const updateOptionValueInStrapiStep = createStep(
  "update-option-value-in-strapi",
  async ({ optionValues }: UpdateOptionValueInStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    const originalData: Record<string, any>[] = []
    const updatedData: Record<string, any>[] = []

    try {
      for (const optionValue of optionValues) {
        // Find the Strapi option value
        const strapiOptionValue = await strapiService.findByMedusaId(
          Collection.PRODUCT_OPTION_VALUES, 
          optionValue.id,
        )

        // Store original data for compensation
        originalData.push(strapiOptionValue)

        // Update option value in Strapi
        const updated = await strapiService.update(Collection.PRODUCT_OPTION_VALUES, strapiOptionValue.documentId, {
          value: optionValue.value,
        })

        updatedData.push(updated.data)
      }
    } catch (error) {
      // If error occurs, pass original data created so far to compensation
      return StepResponse.permanentFailure(
        strapiService.formatStrapiError(error, 'Failed to update option values in Strapi'),
        originalData
      )
    }

    return new StepResponse(
      updatedData,
      originalData
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    // Revert all updates
    for (const originalData of compensationData) {
      await strapiService.update(Collection.PRODUCT_OPTION_VALUES, originalData.documentId, {
        value: originalData.value,
      })
    }
  }
)
