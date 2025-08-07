import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { createPayloadProductsWorkflow } from "../workflows/create-payload-products"

export default async function productCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  id: string
}>) {
  await createPayloadProductsWorkflow(container)
    .run({
      input: {
        product_ids: [data.id],
      }
    })
}

export const config: SubscriberConfig = {
  event: "product.created",
}