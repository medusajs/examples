import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type DeleteOptionFromStrapiInput = {
  id: string
}

export const deleteOptionFromStrapiStep = createStep(
  "delete-option-from-strapi",
  async ({ id }: DeleteOptionFromStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    // Find the Strapi option
    const [strapiOption] = await strapiService.findByMedusaId(Collection.PRODUCT_OPTIONS, id)

    // Delete option from Strapi
    await strapiService.delete(Collection.PRODUCT_OPTIONS, strapiOption.documentId)

    return new StepResponse(
      void 0,
      strapiOption
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    await strapiService.create(Collection.PRODUCT_OPTIONS, {
      medusaId: compensationData.medusaId,
      title: compensationData.title,
      locale: compensationData.locale,
    })
  }
)

