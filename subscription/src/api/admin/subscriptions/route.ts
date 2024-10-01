import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/medusa";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    limit = 20,
    offset = 0,
  } = req.validatedQuery || {}

  const { 
    data: subscriptions,
    metadata: { count, take, skip },
  } = await query.graph({
    entity: "subscription",
    fields: [
      "*",
      "orders.*",
      "customer.*",
      ...(req.validatedQuery?.fields.split(",") || [])
    ],
    pagination: {
      skip: offset,
      take: limit,
      order: {
        subscription_date: "DESC"
      }
    }
  })

  res.json({
    subscriptions,
    count,
    limit: take,
    offset: skip
  })
}