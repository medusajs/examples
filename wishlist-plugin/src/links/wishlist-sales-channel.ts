import { defineLink } from "@medusajs/framework/utils"
import WishlistModule from "../modules/wishlist"
import SalesChannelModule from "@medusajs/medusa/sales-channel"

export default defineLink(
  {
    ...WishlistModule.linkable.wishlist.id,
    field: "sales_channel_id"
  },
  SalesChannelModule.linkable.salesChannel,
  {
    readOnly: true
  }
)