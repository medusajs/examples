import { model } from "@medusajs/framework/utils"
import { Venue } from "./venue"

export enum RowType {
  PREMIUM = "premium",
  BALCONY = "balcony",
  STANDARD = "standard",
  VIP = "vip"
}

export const VenueRow = model.define("venue_row", {
  id: model.id().primaryKey(),
  row_number: model.text(),
  row_type: model.enum(RowType),
  seat_count: model.number(),
  venue: model.belongsTo(() => Venue, {
    mappedBy: "rows"
  })
})
.indexes([
  {
    on: ["venue_id", "row_number"],
    unique: true
  }
])

export default VenueRow
