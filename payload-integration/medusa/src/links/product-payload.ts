import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import { PAYLOAD_MODULE } from "../modules/payload"

export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    field: "id",
  },
  {
    linkable: {
      serviceName: PAYLOAD_MODULE,
      alias: "payload_product",
      primaryKey: "product_id",
    },
  },
  {
    readOnly: true,
  }
)