import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { updateOptionInStrapiWorkflow } from "../workflows/update-option-in-strapi"

export default async function productOptionUpdatedStrapiSyncHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const cachingService = container.resolve(Modules.CACHING)
  const logger = container.resolve("logger")
  
  // Check if this update is being processed from a Strapi webhook
  // If so, skip syncing back to prevent infinite loops
  const cacheKey = `strapi-update:product-option:${data.id}`
  const isProcessingFromStrapi = await cachingService.get({ key: cacheKey })
  
  if (isProcessingFromStrapi) {
    logger.info(`Option ${data.id} update originated from Strapi, skipping sync to prevent infinite loop`)
    return
  }
  
  await updateOptionInStrapiWorkflow(container).run({
    input: {
      id: data.id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "product-option.updated",
}

