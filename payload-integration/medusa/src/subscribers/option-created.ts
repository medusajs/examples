import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { createPayloadProductOptionsWorkflow } from "../workflows/create-payload-product-options"

export default async function productOptionCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  id: string
}>) {
  await createPayloadProductOptionsWorkflow(container)
    .run({
      input: {
        option_ids: [data.id],
      }
    })
}

export const config: SubscriberConfig = {
  event: "product-option.created",
}
