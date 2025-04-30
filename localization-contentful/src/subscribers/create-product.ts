import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework"
import { createProductsContentfulWorkflow } from "../workflows/create-products-contentful"

export default async function handleProductCreate({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await createProductsContentfulWorkflow(container)
    .run({
      input: {
        product_ids: [data.id]
      }
    })

  console.log("Product created in Contentful")
}

export const config: SubscriberConfig = {
  event: "product.created"
}
