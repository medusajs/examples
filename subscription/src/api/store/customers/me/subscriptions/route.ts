import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/medusa";
import { ContainerRegistrationKeys } from "@medusajs/utils"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [customer] } = await query.graph({
    entryPoint: "customer",
    fields: [
      "subscriptions.*"
    ],
    variables: {
      filters: {
        id: [req.auth_context.actor_id]
      }
    }
  })

  res.json({
    subscriptions: customer.subscriptions
  })
}