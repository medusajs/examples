import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"
import { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"

const PersonalizedOrderItemsWidget = ({ data: order }: DetailWidgetProps<AdminOrder>) => {
  const items = order.items.filter((item) => {
    return item.variant?.product?.metadata?.is_personalized
  })

  if (!items.length) {
    return <></>
  }
  
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Personalized Order Items</Heading>
      </div>
      <div className="divide-y">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 px-6 py-4">
            {item.variant?.product?.thumbnail && <img
              src={item.variant.product.thumbnail}
              alt={item.variant.title || "Personalized Product"}
              className="h-8 w-6 object-cover rounded border border-ui-border"
            />}
            <div className="flex flex-col">
              <Text size="small" weight="plus">{item.variant?.product?.title}: {item.variant?.title}</Text>
              <Text size="small" className="text-ui-fg-subtle">
                Width (cm): {item.metadata?.width as number || "N/A"}
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                Height (cm): {item.metadata?.height as number || "N/A"}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default PersonalizedOrderItemsWidget