import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/medusa";
import { remoteQueryObjectFromString } from "@medusajs/utils"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const remoteQuery = req.scope.resolve("remoteQuery")

  const query = remoteQueryObjectFromString({
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

  const result = await remoteQuery(query)

  res.json({
    subscriptions: result[0].subscriptions
  })
}