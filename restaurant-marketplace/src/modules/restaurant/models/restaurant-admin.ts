import { model } from "@medusajs/framework/utils";
import { Restaurant } from "./restaurant";

export const RestaurantAdmin = model.define("restaurant_admin", {
  id: model
    .id()
    .primaryKey(),
  first_name: model.text(),
  last_name: model.text(),
  email: model.text(),
  avatar_url: model.text().nullable(),
  restaurant: model.belongsTo(() => Restaurant, {
    mappedBy: "admins"
  }),
});
