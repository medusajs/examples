import { MedusaService } from "@medusajs/framework/utils"
import { Wishlist } from "./models/wishlist";
import { WishlistItem } from "./models/wishlist-item";

export default class WishlistModuleService extends MedusaService({
  Wishlist,
  WishlistItem
}) {}