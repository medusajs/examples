import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";
import { z } from "zod"

export const GetComplementaryProductsSchema = z.object({
  exclude_product_id: z.string(),
}).merge(createFindParams())

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const {
    exclude_product_id
  } = req.validatedQuery

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
      id: {
        $ne: exclude_product_id as string
      },
      tags: {
        $or: [
          {
            value: {
              $eq: null,
            },
          },
          {
            value: {
              $ne: "addon",
            },
          },
        ],
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