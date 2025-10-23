import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { createProductItemWorkflow } from "../workflows/create-product-item"

export default async function productCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await createProductItemWorkflow(container).run({
    input: {
      product_id: data.id
    }
  })
}

export const config: SubscriberConfig = {
  event: `product.created`,
}