import {
  createWorkflow,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { deleteFilesWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { deleteCategoryImagesStep } from "./steps/delete-category-image"

export type DeleteCategoryImagesInput = {
  ids: string[]
}

export const deleteCategoryImagesWorkflow = createWorkflow(
  "delete-category-images",
  (input: DeleteCategoryImagesInput) => {
    // First, get the category images to retrieve the file_ids
    const { data: categoryImages } = useQueryGraphStep({
      entity: "product_category_image",
      fields: ["id", "file_id", "url", "type", "category_id"],
      filters: {
        id: input.ids,
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    // Transform the category images to extract file IDs
    const fileIds = transform(
      { categoryImages },
      (data) => data.categoryImages.map((img) => img.file_id)
    )

    // Delete the files from storage
    deleteFilesWorkflow.runAsStep({
      input: {
        ids: fileIds,
      },
    })

    // Then delete the category image records
    const result = deleteCategoryImagesStep({ ids: input.ids })

    return new WorkflowResponse(result)
  }
)
