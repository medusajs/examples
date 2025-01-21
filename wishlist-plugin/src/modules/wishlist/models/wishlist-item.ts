import { model } from "@medusajs/framework/utils"
import { Wishlist } from "./wishlist"

export const WishlistItem = model.define("wishlist_item", {
  id: model.id().primaryKey(),
  variant_id: model.text(),
  wishlist: model.belongsTo(() => Wishlist, {
    mappedBy: "items"
  })
})
.indexes([
  {
    on: ["id", "variant_id"],
    unique: true
  }
])