import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { createPayloadProductsWorkflow } from "../workflows/create-payload-products"

export default async function productSyncPayloadHandler({
  container,
}: SubscriberArgs) {
  const query = container.resolve("query")

  const limit = 1000
  let offset = 0
  let count = 0
  
  do {
    const { 
      data: products,
      metadata: { count: totalCount } = {}
    } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "metadata",
      ],
      pagination: {
        take: limit,
        skip: offset,
      }
    })

    count = totalCount || 0
    offset += limit
    const filteredProducts = products.filter(product => !product.metadata?.payload_id)

    if (filteredProducts.length === 0) {
      break
    }

    await createPayloadProductsWorkflow(container)
      .run({
        input: {
          product_ids: filteredProducts.map(product => product.id),
        }
      })

  } while (count > offset + limit)
}

export const config: SubscriberConfig = {
  event: "products.sync-payload",
}