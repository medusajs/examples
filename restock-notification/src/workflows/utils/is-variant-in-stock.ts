import { StepExecutionContext } from "@medusajs/framework/workflows-sdk"
import { confirmVariantInventoryWorkflow } from "@medusajs/medusa/core-flows"
import { ConfirmVariantInventoryWorkflowInputDTO } from "@medusajs/framework/types"

type IsVariantInStockInput = {
  variant_id: string
  sales_channel_id: string
}

export const isVariantInStock = async (
  { variant_id, sales_channel_id }: IsVariantInStockInput, 
  { container, ...context }: StepExecutionContext) => {
  const query = container.resolve("query")

  const { data: variants } = await query.graph(
    {
      entity: "variant",
      fields: [
        "*", 
        "inventory_items.*", 
        // @ts-ignore
        "inventory_items.inventory.location_levels.stock_locations.*",
        // @ts-ignore
        "inventory_items.inventory.location_levels.stock_locations.sales_channels.*"
      ],
      filters: {
        id: variant_id
      }
    },
    {
      throwIfKeyNotFound: true
    }
  )

  let isInStock = false

  try {
    await confirmVariantInventoryWorkflow(container)
      .run({
        input: {
          variants,
          sales_channel_id,
          items: [{
            variant_id,
            quantity: 1
          }],
        } as unknown as ConfirmVariantInventoryWorkflowInputDTO,
        context,
      })
      // no error is thrown, the variant is in stock
      isInStock = true
  } catch (e) {
    // if an error is thrown, the variant isn't in stock
  }
  
  return isInStock
}