import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { deleteVariantItemWorkflow } from "../workflows/delete-variant-item"

export default async function productDeletedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")
  const { data: [product] } = await query.graph({
    entity: "product",
    fields: [
      "variants.id"
    ],
    filters: {
      id: data.id
    },
    withDeleted: true
  })
  for (const variant of product.variants) {
    await deleteVariantItemWorkflow(container).run({
      input: {
        variant_id: variant.id
      },
      throwOnError: false
    })
  }
}

export const config: SubscriberConfig = {
  event: `product.deleted`,
}

