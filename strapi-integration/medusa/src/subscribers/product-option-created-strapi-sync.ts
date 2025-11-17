import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework"
import { createOptionsInStrapiWorkflow } from "../workflows/create-options-in-strapi"

export default async function productOptionCreatedStrapiSyncHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await createOptionsInStrapiWorkflow(container).run({
    input: {
      ids: [data.id],
    },
  })
}

export const config: SubscriberConfig = {
  event: "product-option.created",
}

