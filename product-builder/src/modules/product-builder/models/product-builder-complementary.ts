import { model } from "@medusajs/framework/utils"
import ProductBuilder from "./product-builder"

const ProductBuilderComplementary = model.define("product_builder_complementary", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  product_builder: model.belongsTo(() => ProductBuilder, {
    mappedBy: "complementary_products"
  }),
})

export default ProductBuilderComplementary
