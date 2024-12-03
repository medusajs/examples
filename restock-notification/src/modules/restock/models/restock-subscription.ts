import { model } from "@medusajs/framework/utils"

const RestockSubscription = model.define("restock_subscription", {
  id: model.id().primaryKey(),
  variant_id: model.text(),
  sales_channel_id: model.text(),
  email: model.text(),
  customer_id: model.text().nullable()
})
.indexes([
  {
    on: ["variant_id", "sales_channel_id", "email"],
    unique: true
  }
])

export default RestockSubscription