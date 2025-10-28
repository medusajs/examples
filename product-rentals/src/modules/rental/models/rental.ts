import { model } from "@medusajs/framework/utils"
import { RentalConfiguration } from "./rental-configuration"

export const Rental = model.define("rental", {
  id: model.id().primaryKey(),
  variant_id: model.text(),
  customer_id: model.text(),
  order_id: model.text().nullable(),
  line_item_id: model.text().nullable(),
  rental_start_date: model.dateTime(),
  rental_end_date: model.dateTime(),
  actual_return_date: model.dateTime().nullable(),
  rental_days: model.number(),
  status: model.enum(["pending", "active", "returned", "cancelled"]).default("pending"),
  rental_configuration: model.belongsTo(() => RentalConfiguration, {
    mappedBy: "rentals",
  }),
})

