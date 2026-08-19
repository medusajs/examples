import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { updatePayloadProductOptionsWorkflow } from "../workflows/update-payload-product-options"

export default async function productOptionUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  id: string
}>) {
  await updatePayloadProductOptionsWorkflow(container)
    .run({
      input: {
        option_ids: [data.id],
      }
    })
}

export const config: SubscriberConfig = {
  event: "product-option.updated",
}
