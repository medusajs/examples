import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_MEDIA_MODULE } from "../../modules/product-media"
import ProductMediaModuleService from "../../modules/product-media/service"

export type DeleteCategoryImagesStepInput = {
  ids: string[]
}

export const deleteCategoryImagesStep = createStep(
  "delete-category-images-step",
  async (input: DeleteCategoryImagesStepInput, { container }) => {
    const productMediaService: ProductMediaModuleService =
      container.resolve(PRODUCT_MEDIA_MODULE)

    // Retrieve the full category images data before deleting
    const categoryImages = await productMediaService.listProductCategoryImages({
      id: input.ids,
    })

    // Delete the category images
    await productMediaService.deleteProductCategoryImages(input.ids)

    return new StepResponse(
      { success: true, deleted: input.ids }, 
      categoryImages
    )
  },
  async (categoryImages, { container }) => {
    if (!categoryImages || categoryImages.length === 0) {
      return
    }

    const productMediaService: ProductMediaModuleService =
      container.resolve(PRODUCT_MEDIA_MODULE)

    // Recreate all category images with their original data
    await productMediaService.createProductCategoryImages(
      categoryImages.map((categoryImage) => ({
        id: categoryImage.id,
        category_id: categoryImage.category_id,
        type: categoryImage.type,
        url: categoryImage.url,
        file_id: categoryImage.file_id,
      }))
    )
  }
)


