import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { updatePayloadProductsWorkflow } from "../workflows/update-payload-products"

export default async function productUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  id: string
}>) {
  await updatePayloadProductsWorkflow(container)
    .run({
      input: {
        product_ids: [data.id],
      }
    })
}

export const config: SubscriberConfig = {
  event: "product.updated",
}
