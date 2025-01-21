import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deleteWishlistItemStep } from "./steps/delete-wishlist-item"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import WishlistCustomerLink from "../links/wishlist-customer"
import { validateItemInWishlistStep } from "./steps/validate-item-in-wishlist"

type DeleteWishlistItemWorkflowInput = {
  wishlist_item_id: string
  customer_id: string
}

export const deleteWishlistItemWorkflow = createWorkflow(
  "delete-wishlist-item",
  (input: DeleteWishlistItemWorkflowInput) => {
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

    validateItemInWishlistStep({
      wishlist: wishlistCustomerLinks[0].wishlist,
      wishlist_item_id: input.wishlist_item_id
    })

    deleteWishlistItemStep(input)

    // refetch wishlist
    const { data: wishlists } = useQueryGraphStep({
      entity: "wishlist",
      fields: ["*", "items.*", "items.product_variant.*"],
      filters: {
        id: wishlistCustomerLinks[0].wishlist.id
      }
    }).config({ name: "refetch-wishlist" })

    return new WorkflowResponse({
      wishlist: wishlists[0]
    })
  }
)