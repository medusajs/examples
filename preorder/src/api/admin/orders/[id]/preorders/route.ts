import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve("query")
  const { id: orderId } = req.params

  const { data: preorders } = await query.graph({
    entity: "preorder",
    fields: ["*", "item.*", "item.product_variant.*", "item.product_variant.product.*"],
    filters: {
      order_id: orderId,
    },
  })

  res.json({ preorders })
}