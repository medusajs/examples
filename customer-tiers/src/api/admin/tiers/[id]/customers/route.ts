import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  // Query customers linked to this tier
  const { data: customers, metadata } = await query.index({
    entity: "customer",
    filters: {
      tier: {
        id,
      },
    },
    ...req.queryConfig,
  })

  res.json({
    customers,
    count: metadata?.estimate_count || 0,
    offset: metadata?.skip || 0,
    limit: metadata?.take || 15,
  })
}

