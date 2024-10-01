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

  const { data: [subscription] } = await query.graph({
    entity: "subscription",
    fields: [
      "*",
      "orders.*",
      "customer.*",
      ...(req.validatedQuery?.fields.split(",") || [])
    ],
    filters: {
      id: [req.params.id]
    }
  })

  res.json({
    subscription
  })
}