import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Text } from "@medusajs/ui"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"

const OrderGiftItemsWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const giftItems = data.items?.filter(
    (item: any) => item.metadata?.is_gift === "true"
  )

  if (!giftItems?.length) {
    return null
  }

  return (
    <Container className="mb-4">
      <Text className="font-medium h2-core mb-2">Gift Items & Messages</Text>
      <div className="flex flex-col gap-4">
        {giftItems.map((item: any) => (
          <div key={item.id} className="border-b last:border-b-0 pb-2">
            <Text className="font-medium">{item.title} (x{item.quantity})</Text>
            <Text className="text-sm text-gray-600">
              Gift Message: {item.metadata?.gift_message || "(No message)"}
            </Text>
          </div>
        ))}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default OrderGiftItemsWidget 