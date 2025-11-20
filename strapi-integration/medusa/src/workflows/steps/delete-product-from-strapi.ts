import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type DeleteProductFromStrapiInput = {
  id: string
}

export const deleteProductFromStrapiStep = createStep(
  "delete-product-from-strapi",
  async ({ id }: DeleteProductFromStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    // Find the Strapi product
    const strapiProduct = await strapiService.findByMedusaId(Collection.PRODUCTS, id)

    // Delete product from Strapi
    await strapiService.delete(Collection.PRODUCTS, strapiProduct.documentId)

    return new StepResponse(
      void 0,
      strapiProduct
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    await strapiService.create(Collection.PRODUCTS, {
      medusaId: compensationData.medusaId,
      title: compensationData.title,
      subtitle: compensationData.subtitle,
      description: compensationData.description,
      handle: compensationData.handle,
      images: compensationData.images || [],
      locale: compensationData.locale,
    })
  }
)

