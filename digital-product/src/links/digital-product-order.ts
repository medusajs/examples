import DigitalProductModule from "../modules/digital-product"
import OrderModule from "@medusajs/medusa/order"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  {
    linkable: DigitalProductModule.linkable.digitalProductOrder,
    deleteCascade: true
  },
  OrderModule.linkable.order
)
