import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import ProductMediaModule from "../modules/product-media"

export default defineLink(
  {
    linkable: ProductModule.linkable.productCategory,
    field: "id",
    isList: true,
  },
  {
    ...ProductMediaModule.linkable.productCategoryImage.id,
    primaryKey: "category_id",
  },
  {
    readOnly: true,
  }
)

