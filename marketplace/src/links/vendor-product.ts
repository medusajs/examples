import { defineLink } from "@medusajs/utils"
import MarketplaceModule from "../modules/marketplace"
import ProductModule from "@medusajs/product"

export default defineLink(
  MarketplaceModule.linkable.vendor,
  {
    linkable: ProductModule.linkable.product,
    isList: true
  }
)