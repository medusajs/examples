import { defineLink } from "@medusajs/framework/utils";
import RestockModule from "../modules/restock"
import ProductModule from "@medusajs/medusa/product";

export default defineLink(
  {
    ...RestockModule.linkable.restockSubscription.id,
    field: "variant_id"
  },
  ProductModule.linkable.productVariant,
  {
    readOnly: true
  }
)