import { model } from "@medusajs/framework/utils"
import { OrderStatus } from "../types"
import DigitalProduct from "./digital-product"

const DigitalProductOrder = model.define("digital_product_order", {
  id: model.id().primaryKey(),
  status: model.enum(OrderStatus),
  products: model.manyToMany(() => DigitalProduct, {
    mappedBy: "orders",
    pivotTable: "digitalproduct_digitalproductorders"
  })
})

export default DigitalProductOrder