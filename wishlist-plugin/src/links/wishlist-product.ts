import { defineLink } from "@medusajs/framework/utils"
import WishlistModule from "../modules/wishlist"
import ProductModule from "@medusajs/medusa/product"

export default defineLink(
  {
    ...WishlistModule.linkable.wishlistItem.id,
    field: "product_variant_id"
  },
  ProductModule.linkable.productVariant,
  {
    readOnly: true
  }
)