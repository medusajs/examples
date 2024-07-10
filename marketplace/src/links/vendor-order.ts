import { defineLink } from "@medusajs/utils"
import MarketplaceModule from "../modules/marketplace"
import OrderModule from "@medusajs/order"

export default defineLink(
  MarketplaceModule.linkable.vendor,
  {
    linkable: OrderModule.linkable.order,
    isList: true
  }
)