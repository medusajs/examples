import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { WISHLIST_MODULE } from "../../modules/wishlist"
import WishlistModuleService from "../../modules/wishlist/service"

type CreateWishlistStepInput = {
  customer_id: string
  sales_channel_id: string
}

export const createWishlistStep = createStep(
  "create-wishlist",
  async (input: CreateWishlistStepInput, { container }) => {
    const wishlistModuleService: WishlistModuleService = 
      container.resolve(WISHLIST_MODULE)

    const wishlist = await wishlistModuleService.createWishlists(input)

    return new StepResponse(wishlist, wishlist.id)
  },
  async (id, { container }) => {
    if (!id) {
      return
    }
    const wishlistModuleService: WishlistModuleService = 
      container.resolve(WISHLIST_MODULE)

    await wishlistModuleService.deleteWishlists(id)
  }
)