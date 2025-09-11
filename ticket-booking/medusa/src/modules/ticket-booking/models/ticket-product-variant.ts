import { model } from "@medusajs/framework/utils"
import { TicketProduct } from "./ticket-product"
import { RowType } from "./venue-row"
import { TicketPurchase } from "./ticket-purchase"

export const TicketProductVariant = model.define("ticket_product_variant", {
  id: model.id().primaryKey(),
  product_variant_id: model.text().unique(),
  ticket_product: model.belongsTo(() => TicketProduct, {
    mappedBy: "variants"
  }),
  row_type: model.enum(RowType),
  purchases: model.hasMany(() => TicketPurchase, {
    mappedBy: "ticket_variant"
  })
})
.indexes([
  {
    on: ["ticket_product_id", "row_type"]
  }
])

export default TicketProductVariant
