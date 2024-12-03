import { MedusaContainer } from "@medusajs/framework/types"
import { deepFlatMap, MedusaError, promiseAll } from "@medusajs/framework/utils"

type HasOutOfStockLocationsInput = {
  variant_id: string
  sales_channel_ids: string[]
}

export const hasOutOfStockLocations = async (
  { variant_id, sales_channel_ids }: HasOutOfStockLocationsInput, 
  container: MedusaContainer
) => {
  if (!sales_channel_ids.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "At least one sales channel is required."
    )
  }

  let hasOutOfStock = false
  const query = container.resolve("query")
  const inventoryModuleService = container.resolve("inventory")

  const { data } = await query.graph({
    entity: "variant",
    fields: [
      "inventory.*",
      // @ts-ignore
      "inventory.location_levels.stock_locations.sales_channels.*",
      "manage_inventory",
    ],
    filters: {
      id: variant_id
    }
  })

  if (!data.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Specified variant is not found."
    )
  }
  
  const variant = data[0]

  if (!variant.manage_inventory) {
    return hasOutOfStock
  }

  const inventoriesToCheck: {
    [k in string]: string[]
  } = {}

  deepFlatMap(
    variant,
    "inventory.location_levels.stock_locations.sales_channels",
    ({ inventory, location_levels, sales_channels }) => {
      if (!sales_channel_ids.includes(sales_channels.id)) {
        return
      }

      if (!inventoriesToCheck[inventory.id]) {
        inventoriesToCheck[inventory.id] = []
      }

      inventoriesToCheck[inventory.id].push(location_levels.location_id)
    }
  )

  await promiseAll(
    Object.entries(inventoriesToCheck).map(async ([inventoryId, locationLevelIds]) => {
      if (hasOutOfStock) {
        return
      }
      const inStock = await inventoryModuleService.confirmInventory(
        inventoryId,
        locationLevelIds,
        1
      )

      if (!inStock) {
        hasOutOfStock = true
      }
    })
  )

  return hasOutOfStock
}