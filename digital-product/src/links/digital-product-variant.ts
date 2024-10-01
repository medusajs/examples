import DigitalProductModule from "../modules/digital-product"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  DigitalProductModule.linkable.digitalProduct,
  ProductModule.linkable.productVariant
)
