import { model } from "@medusajs/framework/utils"
import { Venue } from "./venue"
import { TicketProductVariant } from "./ticket-product-variant"
import { TicketPurchase } from "./ticket-purchase"

export const TicketProduct = model.define("ticket_product", {
  id: model.id().primaryKey(),
  product_id: model.text().unique(),
  venue: model.belongsTo(() => Venue),
  dates: model.array(),
  variants: model.hasMany(() => TicketProductVariant, {
    mappedBy: "ticket_product"
  }),
  purchases: model.hasMany(() => TicketPurchase, {
    mappedBy: "ticket_product"
  })
})
.indexes([
  {
    on: ["venue_id", "dates"]
  }
])

export default TicketProduct
