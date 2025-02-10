import { MedusaContainer } from "@medusajs/framework/types"
import { migrateFromMagento } from "../workflows/migrate-from-magento"

export default async function migrateMagentoJob(
  container: MedusaContainer
) {
  await migrateFromMagento(container)
    .run()
}

export const config = {
  name: "migrate-magento-job",
  schedule: "* * * * *"
}
