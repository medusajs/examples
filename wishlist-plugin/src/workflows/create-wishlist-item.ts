import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { validateWishlistSalesChannelStep } from "./steps/validate-wishlist-sales-channel"
import { createWishlistItemStep } from "./steps/create-wishlist-item"
import { validateVariantWishlistStep } from "./steps/validate-variant-wishlist"
import { validateWishlistExistsStep } from "./steps/validate-wishlist-exists"

type CreateWishlistItemWorkflowInput = {
  variant_id: string
  customer_id: string
  sales_channel_id: string
}

export const createWishlistItemWorkflow = createWorkflow(
  "create-wishlist-item",
  (input: CreateWishlistItemWorkflowInput) => {
    const { data: wishlists } = useQueryGraphStep({
      entity: "wishlist",
      fields: ["*", "items.*"],
      filters: {
        customer_id: input.customer_id,
      },
    })

    validateWishlistExistsStep({
      wishlists
    })

    validateWishlistSalesChannelStep({
      wishlist: wishlists[0],
      sales_channel_id: input.sales_channel_id
    })


    validateVariantWishlistStep({
      variant_id: input.variant_id,
      sales_channel_id: input.sales_channel_id,
      wishlist: wishlists[0]
    })

    createWishlistItemStep({
      product_variant_id: input.variant_id,
      wishlist_id: wishlists[0].id
    })

    // refetch wishlist
    const { data: updatedWishlists } = useQueryGraphStep({
      entity: "wishlist",
      fields: ["*", "items.*", "items.product_variant.*"],
      filters: {
        id: wishlists[0].id
      },
    }).config({ name: "refetch-wishlist" })

    return new WorkflowResponse({
      wishlist: updatedWishlists[0],
    })
  }
)