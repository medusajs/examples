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

    const updatedData: Record<string, any>[] = []

    const originalData = await strapiService.findByMedusaId(
      Collection.PRODUCT_OPTION_VALUES, 
      optionValues.map((optionValue) => optionValue.id),
    )
    const originalDataMap = new Map(originalData.map((data) => [data.medusaId, data]))

    try {
      for (const optionValue of optionValues) {
        const originalData = originalDataMap.get(optionValue.id)
        if (!originalData) {
          continue
        }

        // Update option value in Strapi
        const updated = await strapiService.update(Collection.PRODUCT_OPTION_VALUES, originalData.documentId, {
          value: optionValue.value,
        })

        updatedData.push(updated.data)
      }
    } catch (error) {
      // If error occurs, pass original data created so far to compensation
      return StepResponse.permanentFailure(
        strapiService.formatStrapiError(error, 'Failed to update option values in Strapi'),
        originalData.filter((data) => updatedData.some((updated) => updated.medusaId === data.medusaId))
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
