import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { createPayloadProductVariantWorkflow } from "../workflows/create-payload-product-variant"

export default async function productVariantCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  id: string
}>) {
  await createPayloadProductVariantWorkflow(container)
    .run({
      input: {
        variant_ids: [data.id],
      }
    })
}

export const config: SubscriberConfig = {
  event: "product-variant.created",
}