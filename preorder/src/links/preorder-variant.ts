import { defineLink } from "@medusajs/framework/utils";
import PreorderModule from "../modules/preorder"
import ProductModule from "@medusajs/medusa/product";

export default defineLink(
  PreorderModule.linkable.preorderVariant,
  ProductModule.linkable.productVariant,
)