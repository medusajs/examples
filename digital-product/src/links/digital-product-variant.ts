import DigitalProductModule from "../modules/digital-product"
import ProductModule from "@medusajs/product"
import { defineLink } from "@medusajs/utils"

export default defineLink(
  DigitalProductModule.linkable.digitalProduct,
  ProductModule.linkable.productVariant
)
