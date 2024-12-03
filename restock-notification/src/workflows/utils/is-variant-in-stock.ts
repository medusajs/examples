import { MedusaError } from "@medusajs/framework/utils"
import { StepExecutionContext } from "@medusajs/framework/workflows-sdk"

type IsVariantInStockInput = {
  variant_id: string
  sales_channel_id: string
}

export const isVariantInStock = async (
  { variant_id, sales_channel_id }: IsVariantInStockInput, 
  { container, ...context }: StepExecutionContext
) => {
  const query = container.resolve("query")

  const { data: inventory_items } = await query.graph({
    entity: "product_variant_inventory_items",
    fields: [
      "variant_id",
      "required_quantity",
      // @ts-ignore
      "variant.manage_inventory",
      // @ts-ignore
      "variant.allow_backorder",
      // @ts-ignore
      "inventory.*",
      // @ts-ignore
      "inventory.location_levels.*",
    ],
    filters: { variant_id, },
  })

  const { data: channel_locations } = await query.graph({
    entity: "sales_channel_locations",
    fields: ["stock_location_id"],
    filters: { sales_channel_id },
  })

  if (!inventory_items.length || !channel_locations.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Couldn't find variant or sales channel`
    )
  }

  // Create set of location ids for the sales channel
  const locationIds = new Set(channel_locations.map((l) => l.stock_location_id))

  const inventoryQuantities: number[] = []

  for (const link of inventory_items) {
    const requiredQuantity = link.required_quantity
    const availableQuantity = (link.inventory?.location_levels || []).reduce(
      (sum, level) => {
        if (!locationIds.has(level.location_id)) {
          return sum
        }

        return sum + (level?.available_quantity || 0)
      },
      0
    )

    // This will give us the maximum deliverable quantities for each inventory item
    const maxInventoryQuantity = Math.floor(
      availableQuantity / requiredQuantity
    )

    inventoryQuantities.push(maxInventoryQuantity)
  }

  const availableQuantity = inventoryQuantities.length ? Math.min(...inventoryQuantities) : 0

  return availableQuantity > 0
}
