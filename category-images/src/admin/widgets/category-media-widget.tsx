import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"
import { DetailWidgetProps, AdminProductCategory } from "@medusajs/framework/types"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import { CategoryMediaModal } from "../components/category-media/category-media-modal"
import { CategoryImage } from "../types"
import { ThumbnailBadge } from "@medusajs/icons"

type CategoryImagesResponse = {
  category_images: CategoryImage[]
}

const CategoryMediaWidget = ({ data }: DetailWidgetProps<AdminProductCategory>) => {
  const { data: response, isLoading } = useQuery({
    queryKey: ["category-images", data.id],
    queryFn: async () => {
      const result = await sdk.client.fetch<CategoryImagesResponse>(
        `/admin/categories/${data.id}/images`
      )
      return result
    },
  })

  const images = response?.category_images || []

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Media</Heading>
        <CategoryMediaModal categoryId={data.id} existingImages={images} />
      </div>
      <div className="px-6 py-4">
        <div className="grid grid-cols-[repeat(auto-fill,96px)] gap-4">
          {isLoading && (
            <div className="col-span-full">
              <p className="text-ui-fg-subtle text-sm">Loading...</p>
            </div>
          )}
          {!isLoading && images.length === 0 && (
            <div className="col-span-full">
              <p className="text-ui-fg-subtle text-sm">No images added yet</p>
            </div>
          )}
          {images.map((image: CategoryImage) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-subtle"
            >
              <img
                src={image.url}
                alt={`Category ${image.type}`}
                className="h-full w-full object-cover"
              />
              {image.type === "thumbnail" && (
                <div className="absolute top-2 left-2">
                  <ThumbnailBadge />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product_category.details.after",
})

export default CategoryMediaWidget

