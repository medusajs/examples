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
    entryPoint: "subscription",
    fields: [
      "*",
      "orders.*",
      "customer.*",
      ...(req.validatedQuery?.fields.split(",") || [])
    ],
    variables: {
      filters: {
        id: [req.params.id]
      }
    }
  })

  const result = await remoteQuery(query)

  res.json({
    subscription: result[0]
  })
}