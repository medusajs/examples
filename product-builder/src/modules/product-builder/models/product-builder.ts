import { model } from "@medusajs/framework/utils"
import ProductBuilderCustomField from "./product-builder-custom-field"
import ProductBuilderComplementary from "./product-builder-complementary"
import ProductBuilderAddon from "./product-builder-addon"

const ProductBuilder = model.define("product_builder", {
  id: model.id().primaryKey(),
  product_id: model.text().unique(),
  custom_fields: model.hasMany(() => ProductBuilderCustomField, {
    mappedBy: "product_builder"
  }),
  complementary_products: model.hasMany(() => ProductBuilderComplementary, {
    mappedBy: "product_builder"
  }),
  addons: model.hasMany(() => ProductBuilderAddon, {
    mappedBy: "product_builder"
  })
})

export default ProductBuilder
