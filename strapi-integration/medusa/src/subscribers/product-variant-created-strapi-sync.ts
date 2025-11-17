import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework"
import { createVariantsInStrapiWorkflow } from "../workflows/create-variants-in-strapi"

export default async function productVariantCreatedStrapiSyncHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")

  const { data: [variant] } = await query.graph({
    entity: "variant",
    fields: ["product.id"],
    filters: {
      id: data.id
    }
  })

  await createVariantsInStrapiWorkflow(container).run({
    input: {
      ids: [data.id],
      productId: variant.product!.id
    },
  })
}

export const config: SubscriberConfig = {
  event: "product-variant.created",
}

