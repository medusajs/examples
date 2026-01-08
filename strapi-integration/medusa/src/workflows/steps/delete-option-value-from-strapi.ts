import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type DeleteOptionValueFromStrapiInput = {
  ids: string[]
}

export const deleteOptionValueFromStrapiStep = createStep(
  "delete-option-value-from-strapi",
  async ({ ids }: DeleteOptionValueFromStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    const originalData = await strapiService.findByMedusaId(
      Collection.PRODUCT_OPTION_VALUES, 
      ids,
      ["option"]
    )

    for (const data of originalData) {
      // Delete option value from Strapi
      await strapiService.delete(Collection.PRODUCT_OPTION_VALUES, data.documentId)
    }

    return new StepResponse(
      void 0,
      originalData
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)
    
    for (const data of compensationData) {
      await strapiService.create(Collection.PRODUCT_OPTION_VALUES, {
        medusaId: data.medusaId,
        value: data.value,
        option: data.option,
        locale: data.locale,
      })
    }
  }
)

