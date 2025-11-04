import { defineLink } from "@medusajs/framework/utils"
import RentalModule from "../modules/rental"
import OrderModule from "@medusajs/medusa/order"

export default defineLink(
  {
    linkable: RentalModule.linkable.rental,
    field: "order_id",
  },
  OrderModule.linkable.order,
  {
    readOnly: true
  }
)

