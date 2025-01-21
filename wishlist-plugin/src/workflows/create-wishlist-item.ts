import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import WishlistCustomerLink from "../links/wishlist-customer"
import { validateWishlistSalesChannelStep } from "./steps/validate-wishlist-sales-channel"
import { createWishlistItemStep } from "./steps/create-wishlist-item"
import { WISHLIST_MODULE } from "../modules/wishlist"
import { Modules } from "@medusajs/framework/utils"
import { validateVariantWishlistStep } from "./steps/validate-variant-wishlist"

type CreateWishlistItemWorkflowInput = {
  variant_id: string
  customer_id: string
  sales_channel_id: string
}

export const createWishlistItemWorkflow = createWorkflow(
  "create-wishlist-item",
  (input: CreateWishlistItemWorkflowInput) => {
    const { data: wishlistCustomerLinks } = useQueryGraphStep({
      entity: WishlistCustomerLink.entryPoint,
      fields: ["wishlist.*", "wishlist.items.*"],
      filters: {
        customer_id: input.customer_id,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    validateWishlistSalesChannelStep({
      wishlist: wishlistCustomerLinks[0].wishlist,
      sales_channel_id: input.sales_channel_id
    })


    validateVariantWishlistStep({
      variant_id: input.variant_id,
      sales_channel_id: input.sales_channel_id,
      wishlist: wishlistCustomerLinks[0].wishlist
    })

    const wishlistItem = createWishlistItemStep({
      variant_id: input.variant_id,
      wishlist_id: wishlistCustomerLinks[0].wishlist.id
    })

    createRemoteLinkStep([{
      [WISHLIST_MODULE]: {
        wishlist_item_id: wishlistItem.id,
      },
      [Modules.PRODUCT]: {
        product_variant_id: input.variant_id
      }
    }])

    // refetch wishlist
    const { data: wishlists } = useQueryGraphStep({
      entity: "wishlist",
      fields: ["*", "items.*", "items.product_variant.*"],
      filters: {
        id: wishlistCustomerLinks[0].wishlist.id
      },
    }).config({ name: "refetch-wishlist" })

    return new WorkflowResponse({
      wishlist: wishlists[0],
    })
  }
)