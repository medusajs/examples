import { model } from "@medusajs/framework/utils"
import { WishlistItem } from "./wishlist-item"

export const Wishlist = model.define("wishlist", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  sales_channel_id: model.text(),
  items: model.hasMany(() => WishlistItem),
})
.indexes([
  {
    on: ["customer_id", "sales_channel_id"],
    unique: true
  }
])