import { MedusaContainer } from "@medusajs/framework/types"

export default async function migrateMagentoJob(
  container: MedusaContainer
) {
  const eventBusService = container.resolve("event_bus")

  eventBusService.emit({
    name: "migrate.magento",
    data: {
      type: ["product", "category"],
    }
  })
}

export const config = {
  name: "migrate-magento-job",
  schedule: "0 0 * * *"
}
