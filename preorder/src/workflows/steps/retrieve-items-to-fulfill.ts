import { InferTypeOf, OrderLineItemDTO } from "@medusajs/framework/types"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PreorderVariant } from "../../modules/preorder/models/preorder-variant"

export type RetrieveItemsToFulfillStepInput = {
  preorder_variant: InferTypeOf<typeof PreorderVariant>
  line_items: OrderLineItemDTO[]
}

export const retrieveItemsToFulfillStep = createStep(
  "retrieve-items-to-fulfill",
  async ({
    preorder_variant,
    line_items,
  }: RetrieveItemsToFulfillStepInput) => {
    let total = 0
    const itemsToFulfill = line_items.filter((item) =>
      item.variant_id && preorder_variant.variant_id === item.variant_id
    ).map((item) => {
      total += item.total as number
      return {
        id: item.id,
        quantity: item.quantity,
      }
    })

    return new StepResponse({
      items_to_fulfill: itemsToFulfill,
      items_total: total,
    })
  }
)