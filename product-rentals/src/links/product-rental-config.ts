import { defineLink } from "@medusajs/framework/utils"
import RentalModule from "../modules/rental"
import ProductModule from "@medusajs/medusa/product"

export default defineLink(
  ProductModule.linkable.product,
  RentalModule.linkable.rentalConfiguration
)