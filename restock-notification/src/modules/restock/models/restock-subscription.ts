import { model } from "@medusajs/framework/utils"
import RestockSubscriber from "./restock-subscriber"

const RestockSubscription = model.define("restock_subscription", {
  id: model.id().primaryKey(),
  variant_id: model.text(),
  sales_channel_id: model.text(),
  subscribers: model.manyToMany(() => RestockSubscriber, {
    mappedBy: "subscriptions",
    joinColumn: "subscription_id",
    inverseJoinColumn: "subscriber_email",
    pivotTable: "restock_subscription_subscriber"
  })
})
.indexes([
  {
    on: ["variant_id", "sales_channel_id"],
    unique: true
  }
])

export default RestockSubscription