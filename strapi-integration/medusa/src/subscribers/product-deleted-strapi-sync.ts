import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework"
import { deleteProductFromStrapiWorkflow } from "../workflows/delete-product-from-strapi"

export default async function productDeletedStrapiSyncHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  await deleteProductFromStrapiWorkflow(container).run({
    input: {
      id: data.id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "product.deleted",
}

