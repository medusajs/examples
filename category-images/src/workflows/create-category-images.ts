import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createCategoryImagesStep } from "./steps/create-category-images"
import { convertCategoryThumbnailsStep } from "./steps/convert-category-thumbnails"

export type CreateCategoryImagesInput = {
  category_images: {
    category_id: string
    type: "thumbnail" | "image"
    url: string
    file_id: string
  }[]
}

export const createCategoryImagesWorkflow = createWorkflow(
  "create-category-images",
  (input: CreateCategoryImagesInput) => {
    when(input, (data) => data.category_images.some((img) => img.type === "thumbnail"))
    .then(
      () => {
        const categoryIds = transform({
          input
        }, (data) => {
          return data.input.category_images.filter(
            (img) => img.type === "thumbnail"
          ).map((img) => img.category_id)
        })

        convertCategoryThumbnailsStep({
          category_ids: categoryIds,
        })
      }
    )

    const categoryImages = createCategoryImagesStep({
      category_images: input.category_images,
    })

    return new WorkflowResponse(categoryImages)
  }
)

