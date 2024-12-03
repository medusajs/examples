import { model } from "@medusajs/framework/utils";
import RestockSubscription from "./restock-subscription";

const RestockSubscriber = model.define("restock_subscriber", {
  email: model.text().primaryKey(),
  customer_id: model.text().nullable(),
  subscriptions: model.manyToMany(() => RestockSubscription, {
    mappedBy: "subscribers",
  })
})

export default RestockSubscriber