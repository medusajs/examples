import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  
  const { 
    data: subscriptions,
    metadata: { count, take, skip },
  } = await query.graph({
    entity: "subscription",
    ...req.queryConfig,
  })

  res.json({
    subscriptions,
    count,
    limit: take,
    offset: skip
  })
}