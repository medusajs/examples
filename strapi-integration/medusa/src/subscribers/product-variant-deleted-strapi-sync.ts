import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework"
import { deleteVariantFromStrapiWorkflow } from "../workflows/delete-variant-from-strapi"

export default async function productVariantDeletedStrapiSyncHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await deleteVariantFromStrapiWorkflow(container).run({
    input: {
      id: data.id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "product-variant.deleted",
}

