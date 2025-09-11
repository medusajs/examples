import { model } from "@medusajs/framework/utils"
import { TicketProduct } from "./ticket-product"
import { TicketProductVariant } from "./ticket-product-variant"
import { VenueRow } from "./venue-row"

export const TicketPurchase = model.define("ticket_purchase", {
  id: model.id().primaryKey(),
  order_id: model.text(),
  ticket_product: model.belongsTo(() => TicketProduct),
  ticket_variant: model.belongsTo(() => TicketProductVariant),
  venue_row: model.belongsTo(() => VenueRow),
  seat_number: model.text(),
  show_date: model.dateTime(),
  status: model.enum(["pending", "scanned"]).default("pending"),
})
.indexes([
  {
    on: ["order_id"]
  },
  {
    on: ["ticket_product_id", "venue_row_id", "seat_number", "show_date"],
    unique: true
  }
])

export default TicketPurchase
