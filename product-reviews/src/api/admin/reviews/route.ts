import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"

export const GetAdminReviewsSchema = createFindParams()

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve("query")
  
  const { 
    data: reviews, 
    metadata: { count, take, skip } = {
      count: 0,
      take: 20,
      skip: 0
    },
  } = await query.graph({
    entity: "review",
    ...req.queryConfig,
  })

  res.json({ 
    reviews,
    count,
    limit: take,
    offset: skip,
  })
}
