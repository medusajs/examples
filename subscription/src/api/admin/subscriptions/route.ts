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

  const {
    limit = 20,
    offset = 0,
  } = req.validatedQuery || {}

  const query = remoteQueryObjectFromString({
    entryPoint: "subscription",
    fields: [
      "*",
      "orders.*",
      "customer.*",
      ...(req.validatedQuery?.fields.split(",") || [])
    ],
    variables: {
      skip: offset,
      take: limit,
      order: {
        subscription_date: "DESC"
      }
    }
  })

  const { 
    rows, 
    metadata: { count, take, skip },
  } = await remoteQuery(query)

  res.json({
    subscriptions: rows,
    count,
    limit: take,
    offset: skip
  })
}