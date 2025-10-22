import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { deleteProductItemWorkflow } from "../workflows/delete-product-item"

export default async function productDeletedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await deleteProductItemWorkflow(container).run({
    input: {
      product_id: data.id
    },
    throwOnError: false
  })
}

export const config: SubscriberConfig = {
  event: `product.deleted`,
}

