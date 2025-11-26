import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "zod"
import { createTierWorkflow } from "../../../workflows/create-tier"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const query = req.scope.resolve("query")

  const { data: tiers, metadata } = await query.graph({
    entity: "tier",
    ...req.queryConfig,
  })

  res.json({
    tiers,
    count: metadata?.count || 0,
    offset: metadata?.skip || 0,
    limit: metadata?.take || 15,
  })
}

export const CreateTierSchema = z.object({
  name: z.string(),
  promo_id: z.string().nullable(),
  tier_rules: z.array(z.object({
    min_purchase_value: z.number(),
    currency_code: z.string(),
  })),
})

type CreateTierInput = z.infer<typeof CreateTierSchema>

export async function POST(
  req: MedusaRequest<CreateTierInput>,
  res: MedusaResponse
): Promise<void> {
  const { name, promo_id, tier_rules } = req.validatedBody

  console.log("////", promo_id)

  const { result } = await createTierWorkflow(req.scope).run({
    input: {
      name,
      promo_id: promo_id || null,
      tier_rules: tier_rules || [],
    },
  })

  res.json({ tier: result.tier })
}

