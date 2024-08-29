import { model } from "@medusajs/utils";
import { RestaurantAdmin } from "./restaurant-admin";

export const Restaurant = model.define("restaurant", {
  id: model
    .id()
    .primaryKey(),
  handle: model.text(),
  is_open: model.boolean().default(false),
  name: model.text(),
  description: model.text().nullable(),
  phone: model.text(),
  email: model.text(),
  address: model.text(),
  image_url: model.text().nullable(),
  admins: model.hasMany(() => RestaurantAdmin)
});
