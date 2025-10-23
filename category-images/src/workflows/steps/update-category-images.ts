import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_MEDIA_MODULE } from "../../modules/product-media"
import ProductMediaModuleService from "../../modules/product-media/service"

export type UpdateCategoryImagesStepInput = {
  updates: {
    id: string
    type?: "thumbnail" | "image"
  }[]
}

export const updateCategoryImagesStep = createStep(
  "update-category-images-step",
  async (input: UpdateCategoryImagesStepInput, { container }) => {
    const productMediaService: ProductMediaModuleService =
      container.resolve(PRODUCT_MEDIA_MODULE)

    // Get previous data for the images being updated
    const prevData = await productMediaService.listProductCategoryImages({
      id: input.updates.map((u) => u.id),
    })

    // Apply the requested updates
    const updatedData = await productMediaService.updateProductCategoryImages(
      input.updates
    )

    return new StepResponse(updatedData, prevData)
  },
  async (compensationData, { container }) => {
    if (!compensationData?.length) {
      return
    }

    const productMediaService: ProductMediaModuleService =
      container.resolve(PRODUCT_MEDIA_MODULE)

    // Revert all updates
    await productMediaService.updateProductCategoryImages(compensationData.map((img) => ({
      id: img.id,
      type: img.type,
    })))
  }
)


