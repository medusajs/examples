import { model } from "@medusajs/framework/utils"
import ProductBuilder from "./product-builder"

const ProductBuilderCustomField = model.define("product_builder_custom_field", {
  id: model.id().primaryKey(),
  name: model.text(),
  type: model.text(),
  description: model.text().nullable(),
  is_required: model.boolean().default(false),
  product_builder: model.belongsTo(() => ProductBuilder, {
    mappedBy: "custom_fields"
  }),
})

export default ProductBuilderCustomField
