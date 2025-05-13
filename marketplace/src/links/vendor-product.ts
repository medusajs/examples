import { defineLink } from "@medusajs/framework/utils"
import MarketplaceModule from "../modules/marketplace"
import ProductModule from "@medusajs/medusa/product"

export default defineLink(
  MarketplaceModule.linkable.vendor,
  {
    linkable: ProductModule.linkable.product.id,
    isList: true
  }
)