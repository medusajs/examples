import { model } from "@medusajs/framework/utils"
import { Tier } from "./tier"

export const TierRule = model.define("tier_rule", {
  id: model.id().primaryKey(),
  min_purchase_value: model.number(),
  currency_code: model.text(),
  tier: model.belongsTo(() => Tier, {
    mappedBy: "tier_rules",
  }),
})
.indexes([
  {
    on: ["tier_id", "currency_code"],
    unique: true,
  }
])

