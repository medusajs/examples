import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import { 
  DetailWidgetProps, 
  AdminProduct,
} from "@medusajs/framework/types"
import { useState } from "react"
import { ProductBuilderModal } from "../components/product-builder-modal"
import { ProductBuilderResponse } from "../types"

const ProductBuilderWidget = ({ 
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading, refetch } = useQuery<ProductBuilderResponse>({
    queryFn: () => sdk.client.fetch(`/admin/products/${product.id}/builder`),
    queryKey: ["product-builder", product.id],
    retry: false,
  })

  const formatSummary = (items: any[], getTitle: (item: any) => string) => {
    if (!items || items.length === 0) return "-"
    if (items.length === 1) return getTitle(items[0])
    return `${getTitle(items[0])} + ${items.length - 1} more`
  }

  const customFieldsSummary = formatSummary(
    data?.product_builder?.custom_fields || [],
    (field) => field.name
  )

  const complementaryProductsSummary = formatSummary(
    data?.product_builder?.complementary_products || [],
    (item) => item.product?.title || "Unnamed Product"
  )

  const addonsSummary = formatSummary(
    data?.product_builder?.addons || [],
    (item) => item.product?.title || "Unnamed Product"
  )

  return (
    <>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">Builder Configuration</Heading>
          <Button
            size="small"
            variant="secondary"
            onClick={() => setModalOpen(true)}
          >
            Edit
          </Button>
        </div>
        <div>
          {isLoading ? (
            <Text>Loading...</Text>
          ) : (
            <>
              <div
                className={
                  "text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4 border-b"
                }
              >
                <Text size="small" weight="plus" leading="compact">
                  Custom Fields
                </Text>

                <Text
                  size="small"
                  leading="compact"
                  className="whitespace-pre-line text-pretty"
                >
                  {customFieldsSummary}
                </Text>
              </div>
              <div
                className={
                  "text-ui-fg-subtle grid grid-cols-2 px-6 py-4 items-center border-b"
                }
              >
                <Text size="small" weight="plus" leading="compact">
                  Complementary Products
                </Text>

                <Text
                  size="small"
                  leading="compact"
                  className="whitespace-pre-line text-pretty"
                >
                  {complementaryProductsSummary}
                </Text>
              </div>
              <div
                className={
                  "text-ui-fg-subtle grid grid-cols-2 px-6 py-4 items-center"
                }
              >
                <Text size="small" weight="plus" leading="compact">
                  Addon Products
                </Text>

                <Text
                  size="small"
                  leading="compact"
                  className="whitespace-pre-line text-pretty"
                >
                  {addonsSummary}
                </Text>
              </div>
            </>
          )}
        </div>
      </Container>

      <ProductBuilderModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        product={product}
        initialData={data?.product_builder}
        onSuccess={() => {
          refetch()
          setModalOpen(false)
        }}
      />
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ProductBuilderWidget
