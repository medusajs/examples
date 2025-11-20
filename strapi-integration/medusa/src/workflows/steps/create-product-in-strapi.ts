import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type CreateProductInStrapiInput = {
  product: {
    id: string
    title: string
    subtitle?: string
    description?: string
    handle: string
    imageIds?: number[]
    thumbnailId?: number
  }
}

export const createProductInStrapiStep = createStep(
  "create-product-in-strapi",
  async ({ product }: CreateProductInStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    // Create product in Strapi
    const strapiProduct = await strapiService.create(Collection.PRODUCTS, {
      medusaId: product.id,
      title: product.title,
      subtitle: product.subtitle,
      description: product.description,
      handle: product.handle,
      images: product.imageIds || [],
      thumbnail: product.thumbnailId,
    })

    return new StepResponse(
      strapiProduct.data,
      strapiProduct.data
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    // Delete the product
    await strapiService.delete(Collection.PRODUCTS, compensationData.documentId)
  }
)

