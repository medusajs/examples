import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework"
import { createProductInStrapiWorkflow } from "../workflows/create-product-in-strapi"

export default async function productCreatedStrapiSyncHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await createProductInStrapiWorkflow(container).run({
    input: {
      id: data.id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "product.created",
}

