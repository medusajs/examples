import { RefObject } from "react"
import { ArrowDownTray } from "@medusajs/icons"

type CategoryImageUploadProps = {
  fileInputRef: RefObject<HTMLInputElement>
  isUploading: boolean
  onFileSelect: (files: FileList | null) => void
}

export const CategoryImageUpload = ({
  fileInputRef,
  isUploading,
  onFileSelect,
}: CategoryImageUploadProps) => {
  return (
    <div className="bg-ui-bg-base overflow-auto border-b px-6 py-4 lg:border-b-0 lg:border-l">
      <div className="flex flex-col space-y-2">
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-col gap-y-1">
            <div className="flex items-center gap-x-1">
              <label className="font-sans txt-compact-small font-medium">
                Media
              </label>
              <p className="font-normal font-sans txt-compact-small text-ui-fg-muted">
                (Optional)
              </p>
            </div>
            <span className="txt-small text-ui-fg-subtle">
              Add media to the product to showcase it in your storefront.
            </span>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/svg+xml"
              onChange={(e) => onFileSelect(e.target.files)}
              hidden
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-ui-bg-component border-ui-border-strong transition-fg group flex w-full flex-col items-center gap-y-2 rounded-lg border border-dashed p-8 hover:border-ui-border-interactive focus:border-ui-border-interactive focus:shadow-borders-focus outline-none focus:border-solid disabled:opacity-50 disabled:cursor-not-allowed"
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!isUploading) {
                  onFileSelect(e.dataTransfer.files)
                }
              }}
            >
              <div className="text-ui-fg-subtle group-disabled:text-ui-fg-disabled flex items-center gap-x-2">
                <ArrowDownTray />
                <p className="font-normal font-sans txt-medium">
                  {isUploading ? "Uploading..." : "Upload images"}
                </p>
              </div>
              <p className="font-normal font-sans txt-compact-small text-ui-fg-muted group-disabled:text-ui-fg-disabled">
                Drag and drop images here or click to upload.
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

