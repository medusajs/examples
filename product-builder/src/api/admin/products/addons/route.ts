import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve("query")

  const {
    data: products,
    metadata
  } = await query.graph({
    entity: "product",
    fields: [
      "*",
      "variants.*",
    ],
    filters: {
      tags: {
        value: "addon"
      },
      status: "published"
    },
    pagination: req.queryConfig.pagination
  })

  res.json({
    products,
    limit: metadata?.take,
    offset: metadata?.skip,
    count: metadata?.count,
  })
}