import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type UpdateOptionInStrapiInput = {
  option: {
    id: string
    title?: string
  }
}

export const updateOptionInStrapiStep = createStep(
  "update-option-in-strapi",
  async ({ option }: UpdateOptionInStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    // Find the Strapi option
    const [originalData] = await strapiService.findByMedusaId(Collection.PRODUCT_OPTIONS, option.id)

    // Update option in Strapi
    const updated = await strapiService.update(Collection.PRODUCT_OPTIONS, originalData.documentId, {
      title: option.title,
    })

    return new StepResponse(
      updated.data,
      originalData
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    await strapiService.update(Collection.PRODUCT_OPTIONS, compensationData.documentId, {
      title: compensationData.title,
    })
  }
)

