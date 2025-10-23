import {
  createWorkflow,
  WorkflowResponse,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import { updateCategoryImagesStep } from "./steps/update-category-images"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { convertCategoryThumbnailsStep } from "./steps/convert-category-thumbnails"

export type UpdateCategoryImagesInput = {
  updates: {
    id: string
    type?: "thumbnail" | "image"
  }[]
}

export const updateCategoryImagesWorkflow = createWorkflow(
  "update-category-images",
  (input: UpdateCategoryImagesInput) => {
    when(input, (data) => data.updates.some((u) => u.type === "thumbnail"))
    .then(
      () => {
        const categoryImageIds = transform({
          input
        }, (data) => data.input.updates.filter(
          (u) => u.type === "thumbnail"
        ).map((u) => u.id))
        const { data: categoryImages } = useQueryGraphStep({
          entity: "product_category_image",
          fields: ["category_id"],
          filters: {
            id: categoryImageIds,
          },
          options: {
            throwIfKeyNotFound: true
          }
        })
        const categoryIds = transform({
          categoryImages
        }, (data) => data.categoryImages.map((img) => img.category_id))
    
        convertCategoryThumbnailsStep({
          category_ids: categoryIds,
        })  
      }
    )
    const updatedImages = updateCategoryImagesStep({
      updates: input.updates,
    })

    return new WorkflowResponse(updatedImages)
  }
)
