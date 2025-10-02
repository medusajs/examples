import {
  MedusaContainer
} from "@medusajs/framework/types";
import sendProductFeedWorkflow from "../workflows/send-product-feed";

export default async function syncProductFeed(container: MedusaContainer) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code", "countries.*"],
  })

  for (const region of regions) {
    for (const country of region.countries) {
      await sendProductFeedWorkflow(container).run({
        input: {
          currency_code: region.currency_code,
          country_code: country!.iso_2,
        },
      })
    }
  }

  logger.info("Product feed synced for all regions and countries")
}

export const config = {
  name: "sync-product-feed",
  schedule: "*/15 * * * *", // Every 15 minutes
};