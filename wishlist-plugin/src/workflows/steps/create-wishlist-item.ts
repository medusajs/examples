import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import WishlistModuleService from "../../modules/wishlist/service"
import { WISHLIST_MODULE } from "../../modules/wishlist"

type CreateWishlistItemStepInput = {
  wishlist_id: string
  product_variant_id: string
}

export const createWishlistItemStep = createStep(
  "create-wishlist-item",
  async (input: CreateWishlistItemStepInput, { container }) => {
    const wishlistModuleService: WishlistModuleService = 
      container.resolve(WISHLIST_MODULE)

    const item = await wishlistModuleService.createWishlistItems(input)

    return new StepResponse(item, item.id)
  },
  async (id, { container }) => {
    if (!id) {
      return
    }
    const wishlistModuleService: WishlistModuleService = 
      container.resolve(WISHLIST_MODULE)

    await wishlistModuleService.deleteWishlistItems(id)
  }
)