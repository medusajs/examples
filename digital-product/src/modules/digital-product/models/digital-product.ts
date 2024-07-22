import { model } from "@medusajs/utils"
import DigitalProductMedia from "./digital-product-media"
import DigitalProductOrder from "./digital-product-order"

const DigitalProduct = model.define("digital_product", {
  id: model.id().primaryKey(),
  name: model.text(),
  medias: model.hasMany(() => DigitalProductMedia, {
    mappedBy: "digitalProduct"
  }),
  orders: model.manyToMany(() => DigitalProductOrder, {
    mappedBy: "products"
  })
})
.cascades({
  delete: ["medias"]
})

export default DigitalProduct