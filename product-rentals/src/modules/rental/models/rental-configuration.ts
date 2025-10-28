import { model } from "@medusajs/framework/utils"
import { Rental } from "./rental"

export const RentalConfiguration = model.define("rental_configuration", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  min_rental_days: model.number().default(1),
  max_rental_days: model.number().nullable(),
  status: model.enum(["active", "inactive"]).default("active"),
  rentals: model.hasMany(() => Rental, {
    mappedBy: "rental_configuration",
  }),
})
