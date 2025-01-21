import { defineLink } from "@medusajs/framework/utils"
import WishlistModule from "../modules/wishlist"
import ProductModule from "@medusajs/medusa/product"

export default defineLink(
  {
    linkable: WishlistModule.linkable.wishlistItem,
    isList: true,
  },
  ProductModule.linkable.productVariant,
)