import { model } from "@medusajs/utils"
import { Preorder } from "./preorder"

export enum PreorderVariantStatus {
  ENABLED = "enabled",
  DISABLED = "disabled",
}

export const PreorderVariant = model.define(
  "preorder_variant",
  {
    id: model.id().primaryKey(),
    variant_id: model.text().unique(),
    available_date: model.dateTime().index(),
    status: model.enum(Object.values(PreorderVariantStatus))
      .default(PreorderVariantStatus.ENABLED),
    preorders: model.hasMany(() => Preorder, {
      mappedBy: "item",
    })
  }
)