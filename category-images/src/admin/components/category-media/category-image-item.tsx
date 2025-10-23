import { Checkbox, clx } from "@medusajs/ui"
import { ThumbnailBadge } from "@medusajs/icons"

type CategoryImageItemProps = {
  id: string
  url: string
  alt: string
  isThumbnail: boolean
  isSelected: boolean
  onToggleSelect: () => void
}

export const CategoryImageItem = ({
  id,
  url,
  alt,
  isThumbnail,
  isSelected,
  onToggleSelect,
}: CategoryImageItemProps) => {
  return (
    <div
      key={id}
      className="shadow-elevation-card-rest hover:shadow-elevation-card-hover focus-visible:shadow-borders-focus bg-ui-bg-subtle-hover group relative aspect-square h-auto max-w-full overflow-hidden rounded-lg outline-none"
    >
      {isThumbnail && (
        <div className="absolute left-2 top-2">
          <ThumbnailBadge />
        </div>
      )}
      <div className={clx(
        "transition-fg absolute right-2 top-2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100",
        isSelected && "opacity-100"
      )}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
        />
      </div>
      <img
        src={url}
        alt={alt}
        className="size-full object-cover object-center"
      />
    </div>
  )
}

