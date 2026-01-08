import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type UpdateProductInStrapiInput = {
  product: {
    id: string
    title?: string
    subtitle?: string
    description?: string
    handle?: string
    optionIds?: number[]
  }
}

export const updateProductInStrapiStep = createStep(
  "update-product-in-strapi",
  async ({ product }: UpdateProductInStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    // Fetch current Strapi product data for compensation
    const [originalProduct] = await strapiService.findByMedusaId(Collection.PRODUCTS, product.id)

    // Update product in Strapi
    const updateData: Record<string, any> = {}
    if (product.title !== undefined) updateData.title = product.title
    if (product.subtitle !== undefined) updateData.subtitle = product.subtitle
    if (product.description !== undefined) updateData.description = product.description
    if (product.handle !== undefined) updateData.handle = product.handle
    if (product.optionIds !== undefined) updateData.options = product.optionIds

    const updated = await strapiService.update(Collection.PRODUCTS, originalProduct.documentId, updateData)

    return new StepResponse(
      updated.data,
      originalProduct
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    await strapiService.update(Collection.PRODUCTS, compensationData.documentId, {
      title: compensationData.title,
      subtitle: compensationData.subtitle,
      description: compensationData.description,
      handle: compensationData.handle,
      options: compensationData.options?.map((opt) => opt.id) || [],
    })
  }
)

