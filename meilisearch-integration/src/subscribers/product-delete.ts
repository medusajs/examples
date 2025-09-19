import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/framework"
import { deleteProductsFromMeilisearchWorkflow } from "../workflows/delete-products-from-meilisearch"

export default async function productDeleteHandler({ 
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  
  logger.info(`Deleting product ${data.id} from Meilisearch`)

  await deleteProductsFromMeilisearchWorkflow(container)
    .run({
      input: {
        ids: [data.id]
      }
    })
}

export const config: SubscriberConfig = {
  event: "product.deleted",
}
