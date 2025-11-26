import { model } from "@medusajs/framework/utils"
import { TierRule } from "./tier-rule"

export const Tier = model.define("tier", {
  id: model.id().primaryKey(),
  name: model.text(),
  promo_id: model.text().nullable(),
  tier_rules: model.hasMany(() => TierRule, {
    mappedBy: "tier",
  }),
})

