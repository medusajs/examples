import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { createVariantItemWorkflow } from "../workflows/create-variant-item"

export default async function variantCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await createVariantItemWorkflow(container).run({
    input: {
      variant_id: data.id
    }
  })
}

export const config: SubscriberConfig = {
  event: `product-variant.created`,
}