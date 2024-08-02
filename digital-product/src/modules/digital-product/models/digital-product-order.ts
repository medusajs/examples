import { model } from "@medusajs/utils"
import { OrderStatus } from "../types"
import DigitalProduct from "./digital-product"

const DigitalProductOrder = model.define("digital_product_order", {
  id: model.id().primaryKey(),
  status: model.enum(OrderStatus),
  products: model.manyToMany(() => DigitalProduct, {
    mappedBy: "orders"
  })
})

export default DigitalProductOrder