import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const query = req.scope.resolve("query")

  const { data: rentals } = await query.graph({
    entity: "rental",
    fields: [
      "*",
      "product_variant.id",
      "product_variant.title",
      "product_variant.product.id",
      "product_variant.product.title",
      "product_variant.product.thumbnail"
    ],
    filters: {
      order_id: id,
    },
  })

  res.json({ rentals })
}