import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { deleteVariantItemWorkflow } from "../workflows/delete-variant-item"

export default async function variantDeletedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await deleteVariantItemWorkflow(container).run({
    input: {
      variant_id: data.id
    }
  })
}

export const config: SubscriberConfig = {
  event: `product-variant.deleted`,
}

