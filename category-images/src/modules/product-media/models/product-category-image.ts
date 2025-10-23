import { model } from "@medusajs/framework/utils"

const ProductCategoryImage = model.define("product_category_image", {
  id: model.id().primaryKey(),
  url: model.text(),
  file_id: model.text(),
  type: model.enum(["thumbnail", "image"]),
  category_id: model.text(),
})
  .indexes([
    {
      on: ["category_id", "type"],
      where: "type = 'thumbnail'",
      unique: true,
      name: "unique_thumbnail_per_category",
    },
  ])

export default ProductCategoryImage

