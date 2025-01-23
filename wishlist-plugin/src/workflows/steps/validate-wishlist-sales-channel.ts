import { createStep } from "@medusajs/framework/workflows-sdk"
import { InferTypeOf } from "@medusajs/framework/types"
import { Wishlist } from "../../modules/wishlist/models/wishlist"

type ValidateWishlistSalesChannelStepInput = {
  wishlist: InferTypeOf<typeof Wishlist>
  sales_channel_id: string
}

export const validateWishlistSalesChannelStep = createStep(
  "validate-wishlist-sales-channel",
  async (input: ValidateWishlistSalesChannelStepInput, { container }) => {
    const { wishlist, sales_channel_id } = input

    if (wishlist.sales_channel_id !== sales_channel_id) {
      throw new Error("Wishlist does not belong to the current sales channel")
    }
  }
)