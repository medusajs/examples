import { defineLink } from "@medusajs/framework/utils"
import RentalModule from "../modules/rental"
import ProductModule from "@medusajs/medusa/product"

export default defineLink(
  {
    linkable: RentalModule.linkable.rental,
    field: "variant_id",
  },
  ProductModule.linkable.productVariant,
  {
    readOnly: true
  }
)

