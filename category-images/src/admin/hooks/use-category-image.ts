import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import { CategoryImage } from "../types"

type UseCategoryImageMutationsProps = {
  categoryId: string
  onCreateSuccess?: () => void
  onUpdateSuccess?: () => void
  onDeleteSuccess?: (deletedIds: string[]) => void
}

export const useCategoryImageMutations = ({
  categoryId,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}: UseCategoryImageMutationsProps) => {
  const queryClient = useQueryClient()

  const uploadFilesMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const response = await sdk.admin.upload.create({ files })
      return response
    },
    onError: (error) => {
      console.error("Failed to upload files:", error)
    },
  })

  const createImagesMutation = useMutation({
    mutationFn: async (images: Omit<CategoryImage, "id" | "category_id">[]) => {
      const response = await sdk.client.fetch(
        `/admin/categories/${categoryId}/images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            images,
          },
        }
      )
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-images", categoryId] })
      onCreateSuccess?.()
    },
  })

  const updateImagesMutation = useMutation({
    mutationFn: async (
      updates: { id: string; type: "thumbnail" | "image" }[]
    ) => {
      const response = await sdk.client.fetch(
        `/admin/categories/${categoryId}/images/batch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            updates,
          },
        }
      )
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-images", categoryId] })
      onUpdateSuccess?.()
    },
  })

  const deleteImagesMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await sdk.client.fetch(
        `/admin/categories/${categoryId}/images/batch`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            ids,
          },
        }
      )
      return response
    },
    onSuccess: (_data, deletedIds) => {
      queryClient.invalidateQueries({ queryKey: ["category-images", categoryId] })
      onDeleteSuccess?.(deletedIds)
    },
  })

  return {
    uploadFilesMutation,
    createImagesMutation,
    updateImagesMutation,
    deleteImagesMutation,
  }
}

