import { defineLink } from "@medusajs/framework/utils"
import RentalModule from "../modules/rental"
import OrderModule from "@medusajs/medusa/order"

export default defineLink(
  {
    linkable: RentalModule.linkable.rental,
    field: "line_item_id",
  },
  OrderModule.linkable.orderLineItem,
  {
    readOnly: true
  }
)

