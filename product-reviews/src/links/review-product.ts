import { defineLink } from "@medusajs/framework/utils"
import ProductReviewModule from "../modules/product-review"
import ProductModule from "@medusajs/medusa/product"

export default defineLink(
  {
    linkable: ProductReviewModule.linkable.review,
    field: "product_id"
  },
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
  {
    readOnly: true
  }
)