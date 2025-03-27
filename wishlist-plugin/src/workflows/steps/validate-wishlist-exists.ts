import { MedusaError } from "@medusajs/framework/utils"
import { createStep } from "@medusajs/framework/workflows-sdk"
import { InferTypeOf } from "@medusajs/framework/types"
import { Wishlist } from "../../modules/wishlist/models/wishlist"

type Input = {
  wishlists?: InferTypeOf<typeof Wishlist>[]
}

export const validateWishlistExistsStep = createStep(
  "validate-wishlist-exists",
  async (input: Input) => {
    if (!input.wishlists?.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "No wishlist found for this customer"
      )
    }
  }
)