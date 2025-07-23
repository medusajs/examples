import { InferTypeOf, OrderDTO, OrderLineItemDTO, ProductVariantDTO } from "@medusajs/framework/types"
import { PreorderVariant } from "../../modules/preorder/models/preorder-variant"
import { Preorder, PreorderStatus } from "../../modules/preorder/models/preorder"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export type RetrievePreorderUpdatesStep = {
  order: OrderDTO & {
    items: (OrderLineItemDTO & {
      variant?: ProductVariantDTO & {
        preorder_variant?: InferTypeOf<typeof PreorderVariant>
      }
    })[]
  }
  preorders?: InferTypeOf<typeof Preorder>[]
}

export const retrievePreorderUpdatesStep = createStep(
  "retrieve-preorder-updates",
  async ({ order, preorders }: RetrievePreorderUpdatesStep) => {
    const preordersToCancel: {
      id: string
      status: PreorderStatus.CANCELLED
    }[] = []
    const preordersToCreate: {
      preorder_variant_ids: string[]
      order_id: string
    } = {
      preorder_variant_ids: [],
      order_id: order.id,
    }

    for (const item of order.items) {
      if (
        !item.variant?.preorder_variant || 
        item.variant.preorder_variant.status === "disabled" || 
        item.variant.preorder_variant.available_date < new Date()
      ) {
        continue
      }
      const preorder = preorders?.find((p) => p.item.variant_id === item.variant_id)
      if (!preorder) {
        preordersToCreate.preorder_variant_ids.push(item.variant.preorder_variant.id)
      }
    }

    for (const preorder of (preorders || [])) {
      const item = order.items.find((i) => i.variant_id === preorder.item.variant_id)
      if (!item) {
        preordersToCancel.push({
          id: preorder.id,
          status: PreorderStatus.CANCELLED,
        })
      }
    }

    return new StepResponse({
      preordersToCancel,
      preordersToCreate,
    })
  }
)