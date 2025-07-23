import { CartLineItemDTO, ProductVariantDTO } from "@medusajs/framework/types"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export type RetrievePreorderItemIdsStepInput = {
  line_items: (CartLineItemDTO & {
    variant: ProductVariantDTO & {
      preorder_variant?: {
        id: string
      }
    }
  })[]
}

export const retrievePreorderItemIdsStep = createStep(
  "retrieve-preorder-item-ids",
  async ({ line_items }: RetrievePreorderItemIdsStepInput) => {
    const variantIds: string[] = []

    line_items.forEach((item) => {
      if (item.variant.preorder_variant) {
        variantIds.push(item.variant.preorder_variant.id)
      }
    })

    return new StepResponse(variantIds)
  }
)