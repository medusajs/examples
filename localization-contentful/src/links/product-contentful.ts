import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import { CONTENTFUL_MODULE } from "../modules/contentful"

export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    field: "id"
  },
  {
    linkable: {
      serviceName: CONTENTFUL_MODULE,
      alias: "contentful_product",
      primaryKey: "product_id"
    }
  },
  {
    readOnly: true
  }
)
