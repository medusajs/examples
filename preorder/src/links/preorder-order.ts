import { defineLink } from "@medusajs/framework/utils";
import PreorderModule from "../modules/preorder"
import OrderModule from "@medusajs/medusa/order";

export default defineLink(
  {
    linkable: PreorderModule.linkable.preorder,
    field: "order_id",
  },
  OrderModule.linkable.order,
  {
    readOnly: true,
  }
)