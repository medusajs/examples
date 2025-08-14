import ProductBuilderModule from "../modules/product-builder"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  {
    linkable: ProductBuilderModule.linkable.productBuilder,
    deleteCascade: true
  },
  ProductModule.linkable.product
)
