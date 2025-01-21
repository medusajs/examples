import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import WishlistModuleService from "../../modules/wishlist/service"
import { WISHLIST_MODULE } from "../../modules/wishlist"

type DeleteWishlistItemStepInput = {
  wishlist_item_id: string
}

export const deleteWishlistItemStep = createStep(
  "delete-wishlist-item",
  async ({ wishlist_item_id }: DeleteWishlistItemStepInput, { container }) => {
    const wishlistModuleService: WishlistModuleService = container.resolve(WISHLIST_MODULE)

    await wishlistModuleService.softDeleteWishlistItems(wishlist_item_id)

    return new StepResponse(void 0, wishlist_item_id)
  },
  async (wishlistItemId, { container }) => {
    const wishlistModuleService: WishlistModuleService = container.resolve(WISHLIST_MODULE)

    await wishlistModuleService.restoreWishlistItems([wishlistItemId])
  }
)