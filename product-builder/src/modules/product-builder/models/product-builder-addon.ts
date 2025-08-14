import { model } from "@medusajs/framework/utils"
import ProductBuilder from "./product-builder"

const ProductBuilderAddon = model.define("product_builder_addon", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  product_builder: model.belongsTo(() => ProductBuilder, {
    mappedBy: "addons"
  }),
})

export default ProductBuilderAddon
