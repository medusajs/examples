import { InferTypeOf } from "@medusajs/framework/types"
import { Wishlist } from "../../modules/wishlist/models/wishlist"
import { createStep } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

type ValidateVariantWishlistStepInput = {
  variant_id: string
  sales_channel_id: string
  wishlist: InferTypeOf<typeof Wishlist>
}

export const validateVariantWishlistStep = createStep(
  "validate-variant-in-wishlist",
  async ({ 
    variant_id, 
    sales_channel_id,
    wishlist
  }: ValidateVariantWishlistStepInput, { container }) => {
    // validate whether variant is in wishlist
    const isInWishlist = wishlist.items?.some((item) => item.product_variant_id === variant_id)

    if (isInWishlist) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Variant is already in wishlist",
      )
    }

    // validate that the variant is available in the specified sales channel
    const query = container.resolve("query")
    const { data } = await query.graph({
      entity: "variant",
      fields: ["product.sales_channels.*"],
      filters: {
        id: variant_id
      }
    })

    const variantInSalesChannel = data[0].product.sales_channels.some((sc) => sc.id === sales_channel_id)

    if (!variantInSalesChannel) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Variant is not available in the specified sales channel",
      )
    }
  }
)