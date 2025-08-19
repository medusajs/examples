import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { deletePayloadProductOptionsWorkflow } from "../workflows/delete-payload-product-options"

export default async function productOptionDeletedHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  id: string
}>) {
  await deletePayloadProductOptionsWorkflow(container)
    .run({
      input: {
        option_ids: [data.id],
      }
    })
}

export const config: SubscriberConfig = {
  event: "product-option.deleted",
}
