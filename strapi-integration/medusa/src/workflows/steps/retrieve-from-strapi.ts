import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type RetrieveFromStrapiInput = {
  collection: Collection
  ids: string[]
  populate?: string[]
}

export const retrieveFromStrapiStep = createStep(
  "retrieve-from-strapi",
  async ({ collection, ids, populate }: RetrieveFromStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    const items = await strapiService.findByMedusaId(collection, ids, populate)

    return new StepResponse(items)
  }
)

