import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_MEDIA_MODULE } from "../../modules/product-media"
import ProductMediaModuleService from "../../modules/product-media/service"

export type ConvertCategoryThumbnailsStepInput = {
  category_ids: string[]
}

export const convertCategoryThumbnailsStep = createStep(
  "convert-category-thumbnails-step",
  async (input: ConvertCategoryThumbnailsStepInput, { container }) => {
    const productMediaService: ProductMediaModuleService =
      container.resolve(PRODUCT_MEDIA_MODULE)

    // Find existing thumbnails in the specified categories
    const existingThumbnails = await productMediaService.listProductCategoryImages({
      type: "thumbnail",
      category_id: input.category_ids,
    })

    if (existingThumbnails.length === 0) {
      return new StepResponse([], [])
    }

    // Store previous states for compensation
    const compensationData: string[] = existingThumbnails.map((t) => t.id)

    // Convert existing thumbnails to "image" type
    await productMediaService.updateProductCategoryImages(
      existingThumbnails.map((t) => ({
        id: t.id,
        type: "image" as const,
      }))
    )

    return new StepResponse(existingThumbnails, compensationData)
  },
  async (compensationData, { container }) => {
    if (!compensationData?.length) {
      return
    }

    const productMediaService: ProductMediaModuleService =
      container.resolve(PRODUCT_MEDIA_MODULE)

    // Revert thumbnails back to "thumbnail" type
    await productMediaService.updateProductCategoryImages(compensationData.map((id) => ({
      id,
      type: "thumbnail" as const,
    })))
  }
)

