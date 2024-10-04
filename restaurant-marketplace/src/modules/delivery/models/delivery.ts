import { model } from "@medusajs/framework/utils";
import { DeliveryStatus } from "../types";
import { Driver } from "./driver";

export const Delivery = model.define("delivery", {
  id: model
    .id()
    .primaryKey(),
  transaction_id: model.text().nullable(),
  delivery_status: model.enum(DeliveryStatus).default(DeliveryStatus.PENDING),
  eta: model.dateTime().nullable(),
  delivered_at: model.dateTime().nullable(),
  driver: model.belongsTo(() => Driver, {
    mappedBy: "deliveries"
  }).nullable()
});
