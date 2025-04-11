import { model } from "@medusajs/framework/utils"

const LoyaltyPoint = model.define("loyalty_point", {
  id: model.id().primaryKey(),
  points: model.number().default(0),
  customer_id: model.text().unique("IDX_LOYALTY_CUSTOMER_ID"), 
})

export default LoyaltyPoint

