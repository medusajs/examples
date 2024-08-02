import DigitalProductModule from "../modules/digital-product"
import OrderModule from "@medusajs/order"
import { defineLink } from "@medusajs/utils"

export default defineLink(
  {
    linkable: DigitalProductModule.linkable.digitalProductOrder,
    deleteCascade: true
  },
  OrderModule.linkable.order
)
