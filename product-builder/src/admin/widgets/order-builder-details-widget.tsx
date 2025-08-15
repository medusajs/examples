import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, clx } from "@medusajs/ui"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"

type BuilderLineItemMetadata = {
  is_builder_main_product?: boolean
  main_product_line_item_id?: string
  product_builder_id?: string
  custom_fields?: {
    field_id: string
    name?: string
    value: string
  }[]
  is_addon?: boolean
  cart_line_item_id?: string
}

type LineItemWithBuilderMetadata = {
  id: string
  product_title: string
  variant_title?: string
  quantity: number
  metadata?: BuilderLineItemMetadata
}

const OrderBuilderDetailsWidget = ({ 
  data: order,
}: DetailWidgetProps<AdminOrder>) => {
  const orderItems = (order.items || []) as LineItemWithBuilderMetadata[]

  // Find all builder main products (items with custom configurations)
  const builderItems = orderItems.filter(item => 
    item.metadata?.is_builder_main_product || 
    item.metadata?.custom_fields?.length
  )

  // If no builder items, don't show the widget
  if (builderItems.length === 0) {
    return null
  }

  const getAddonItems = (mainItemId: string) => {
    return orderItems.filter(item => 
      item.metadata?.main_product_line_item_id === mainItemId &&
      item.metadata?.is_addon === true
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Items with Builder Configurations</Heading>
      </div>

      <div className="px-6 py-4">
        {builderItems.map((item, index) => {
          const addonItems = getAddonItems(item.metadata?.cart_line_item_id || "")
          const isLastItem = index === builderItems.length - 1
          
          return (
            <div key={item.id} className={clx(
              "mb-6 last:mb-0",
              !isLastItem && "pb-6 border-b border-ui-border-base"
            )}>
              {/* Main Product Info */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Text className="font-medium text-ui-fg-base">
                    {item.product_title}
                  </Text>
                  {item.variant_title && (
                    <Text className="text-ui-fg-muted text-sm">
                      Variant: {item.variant_title}
                    </Text>
                  )}
                  <Text className="text-ui-fg-muted text-sm">
                    Quantity: {item.quantity}
                  </Text>
                </div>
              </div>

              {/* Custom Fields */}
              {item.metadata?.custom_fields && item.metadata.custom_fields.length > 0 && (
                <div className="mb-4 p-3 bg-ui-bg-field rounded-lg">
                  <Text className="font-medium text-ui-fg-base mb-2 txt-compact-medium">
                    Custom Fields
                  </Text>
                  <div className="space-y-1">
                    {item.metadata.custom_fields.map((field, index) => (
                      <div key={field.field_id || index} className="flex justify-between">
                        <Text className="text-ui-fg-subtle txt-compact-sm">
                          {field.name || `Field ${index + 1}`}
                        </Text>
                        <Text className="text-ui-fg-subtle txt-compact-sm">
                          {field.value}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Addon Products */}
              {addonItems.length > 0 && (
                <div className="p-3 bg-ui-bg-field rounded-lg">
                  <Text className="font-medium text-ui-fg-base mb-2 txt-compact-medium">
                    Add-on Products ({addonItems.length})
                  </Text>
                  <div className="space-y-2">
                    {addonItems.map((addon) => (
                      <div key={addon.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <Text className="text-ui-fg-base txt-compact-sm">
                            {addon.product_title}
                          </Text>
                          {addon.variant_title && (
                            <Text className="text-ui-fg-muted txt-compact-xs">
                              Variant: {addon.variant_title}
                            </Text>
                          )}
                          <Text className="text-ui-fg-muted txt-compact-sm">
                            Quantity: {addon.quantity}
                          </Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default OrderBuilderDetailsWidget
