import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { migrateCategoriesStep } from "./steps/migrate-categories"

export const migrateFromMagento = createWorkflow(
  "migrate-from-magento",
  () => {
    migrateCategoriesStep()
  }
)