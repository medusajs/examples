import { model } from "@medusajs/framework/utils";
import { Delivery } from "./delivery";

export const Driver = model.define("driver", {
  id: model
    .id()
    .primaryKey(),
  first_name: model.text(),
  last_name: model.text(),
  email: model.text(),
  phone: model.text(),
  avatar_url: model.text().nullable(),
  deliveries: model.hasMany(() => Delivery, {
    mappedBy: "driver"
  })
});
