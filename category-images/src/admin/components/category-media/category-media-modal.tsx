import { useState, useRef } from "react"
import { FocusModal, Button, Heading, CommandBar, toast } from "@medusajs/ui"
import { useQueryClient } from "@tanstack/react-query"
import { CategoryImage, UploadedFile } from "../../types"
import { CategoryImageGallery } from "./category-image-gallery"
import { CategoryImageUpload } from "./category-image-upload"
import { useCategoryImageMutations } from "../../hooks/use-category-image"

type CategoryMediaModalProps = {
  categoryId: string
  existingImages: CategoryImage[]
}

export const CategoryMediaModal = ({
  categoryId,
  existingImages,
}: CategoryMediaModalProps) => {
  const [open, setOpen] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set())
  const [currentThumbnailId, setCurrentThumbnailId] = useState<string | null>(null)
  const [imagesToDelete, setImagesToDelete] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const {
    uploadFilesMutation,
    createImagesMutation,
    updateImagesMutation,
    deleteImagesMutation,
  } = useCategoryImageMutations({
    categoryId,
    onCreateSuccess: () => {
      setOpen(false)
      resetModalState()
    },
    onUpdateSuccess: () => {
      setSelectedImageIds(new Set())
    },
    onDeleteSuccess: (deletedIds) => {
      setSelectedImageIds(new Set())
      if (currentThumbnailId && deletedIds.includes(currentThumbnailId)) {
        setCurrentThumbnailId(null)
      }
    },
  })

  const isSaving = 
    createImagesMutation.isPending ||
    updateImagesMutation.isPending ||
    deleteImagesMutation.isPending

  const resetModalState = () => {
    setUploadedFiles([])
    setSelectedImageIds(new Set())
    setCurrentThumbnailId(null)
    setImagesToDelete(new Set())
  }

  const initializeThumbnail = () => {
    const thumbnailImage = existingImages.find((img) => img.type === "thumbnail")
    if (thumbnailImage?.id) {
      setCurrentThumbnailId(thumbnailImage.id)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      initializeThumbnail()
    } else {
      resetModalState()
    }
  }

  const handleUploadFile = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const filesArray = Array.from(files)
    
    uploadFilesMutation.mutate(filesArray, {
      onSuccess: (data) => {
        setUploadedFiles((prev) => [...prev, ...data.files])
      },
    })
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImageSelection = (id: string, isUploaded: boolean = false) => {
    const itemId = isUploaded ? `uploaded:${id}` : id
    const newSelected = new Set(selectedImageIds)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedImageIds(newSelected)
  }

  const handleSetAsThumbnail = () => {
    if (selectedImageIds.size !== 1) return

    const selectedId = Array.from(selectedImageIds)[0]
    setCurrentThumbnailId(selectedId)
    if (selectedId.startsWith("uploaded:")) {
      // update uploaded file type to thumbnail
      const uploadedFileId = selectedId.replace("uploaded:", "")
      setUploadedFiles((prev) =>
        prev.map((file) => file.id === uploadedFileId ? { ...file, type: "thumbnail" } : file)
      )
    }
    
    setSelectedImageIds(new Set())
  }

  const handleDelete = () => {
    if (selectedImageIds.size === 0) return

    const uploadedFileIds: string[] = []
    const savedImageIds: string[] = []

    selectedImageIds.forEach((id) => {
      if (id.startsWith("uploaded:")) {
        uploadedFileIds.push(id.replace("uploaded:", ""))
      } else {
        savedImageIds.push(id)
      }
    })

    if (uploadedFileIds.length > 0) {
      setUploadedFiles((prev) =>
        prev.filter((file) => !uploadedFileIds.includes(file.id))
      )
      if (currentThumbnailId?.startsWith("uploaded:")) {
        const thumbnailFileId = currentThumbnailId.replace("uploaded:", "")
        if (uploadedFileIds.includes(thumbnailFileId)) {
          setCurrentThumbnailId(null)
        }
      }
    }

    if (savedImageIds.length > 0) {
      setImagesToDelete((prev) => {
        const newSet = new Set(prev)
        savedImageIds.forEach((id) => newSet.add(id))
        return newSet
      })
      if (currentThumbnailId && savedImageIds.includes(currentThumbnailId)) {
        setCurrentThumbnailId(null)
      }
    }

    setSelectedImageIds(new Set())
  }

  const handleSave = async () => {
    const hasNewImages = uploadedFiles.length > 0
    const hasImagesToDelete = imagesToDelete.size > 0
    
    const initialThumbnail = existingImages.find((img) => img.type === "thumbnail")
    const thumbnailChanged = 
      currentThumbnailId && 
      !currentThumbnailId.startsWith("uploaded:") &&
      currentThumbnailId !== initialThumbnail?.id

    if (!hasNewImages && !hasImagesToDelete && !thumbnailChanged) {
      setOpen(false)
      return
    }

    try {
      const operations: Array<Promise<unknown>> = []
      if (hasNewImages) {
        const imagesToCreate = uploadedFiles.map((file) => ({
          url: file.url,
          file_id: file.id,
          type: file.type || (currentThumbnailId === `uploaded:${file.id}` ? 
            "thumbnail" : "image"
          ),
        }))
        operations.push(createImagesMutation.mutateAsync(imagesToCreate))
      }

      // Update thumbnail if changed
      if (thumbnailChanged) {
        const updates = [
          {
            id: currentThumbnailId,
            type: "thumbnail" as const,
          },
        ]
        operations.push(updateImagesMutation.mutateAsync(updates))
      }

      if (hasImagesToDelete) {
        const idsToDelete = Array.from(imagesToDelete)
        operations.push(deleteImagesMutation.mutateAsync(idsToDelete))
      }

      await Promise.all(operations)

      queryClient.invalidateQueries({ queryKey: ["category-images", categoryId] })
      setOpen(false)
      resetModalState()
      toast.success("Category media saved successfully")
    } catch (error) {
      toast.error("Failed to save changes")
    }
  }

  return (
    <>
      <CommandBar open={selectedImageIds.size > 0}>
        <CommandBar.Bar>
          <CommandBar.Value>
            {selectedImageIds.size} selected
          </CommandBar.Value>
          <CommandBar.Seperator />
          <CommandBar.Command
            action={handleSetAsThumbnail}
            label="Set as thumbnail"
            shortcut="t"
            disabled={selectedImageIds.size !== 1}
          />
          <CommandBar.Seperator />
          <CommandBar.Command
            action={handleDelete}
            label="Delete"
            shortcut="d"
          />
        </CommandBar.Bar>
      </CommandBar>

      <FocusModal open={open} onOpenChange={handleOpenChange}>
        <FocusModal.Trigger asChild>
          <Button size="small" variant="secondary">
            Edit
          </Button>
        </FocusModal.Trigger>

        <FocusModal.Content>
          <FocusModal.Header>
            <Heading>Edit Media</Heading>
          </FocusModal.Header>

          <FocusModal.Body className="flex h-full overflow-hidden">
            <div className="flex w-full h-full flex-col-reverse lg:grid lg:grid-cols-[1fr_560px]">
              <CategoryImageGallery
                existingImages={existingImages}
                uploadedFiles={uploadedFiles}
                imagesToDelete={imagesToDelete}
                currentThumbnailId={currentThumbnailId}
                selectedImageIds={selectedImageIds}
                onToggleSelect={handleImageSelection}
              />
              <CategoryImageUpload
                fileInputRef={fileInputRef}
                isUploading={uploadFilesMutation.isPending}
                onFileSelect={handleUploadFile}
              />
            </div>
          </FocusModal.Body>
          <FocusModal.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <FocusModal.Close asChild>
                <Button size="small" variant="secondary">
                  Cancel
                </Button>
              </FocusModal.Close>
              <Button
                size="small"
                onClick={handleSave}
                isLoading={isSaving}
              >
                Save
              </Button>
            </div>
          </FocusModal.Footer>
        </FocusModal.Content>
      </FocusModal>
    </>
  )
}

