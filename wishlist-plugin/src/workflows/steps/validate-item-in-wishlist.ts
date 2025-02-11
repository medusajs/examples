import { InferTypeOf } from "@medusajs/framework/types"
import { Wishlist } from "../../modules/wishlist/models/wishlist"
import { createStep } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

type ValidateItemInWishlistStepInput = {
  wishlist: InferTypeOf<typeof Wishlist>
  wishlist_item_id: string
}

export const validateItemInWishlistStep = createStep(
  "validate-item-in-wishlist",
  async ({ wishlist, wishlist_item_id }: ValidateItemInWishlistStepInput, { container }) => {
    const item = wishlist.items.find((item) => item.id === wishlist_item_id)

    if (!item) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Item does not exist in customer's wishlist",
      )
    }
  }
)