import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "zod"
import { updateTierWorkflow } from "../../../../workflows/update-tier"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const query = req.scope.resolve("query")
  const { id } = req.params

  const { data: tiers } = await query.graph({
    entity: "tier",
    filters: {
      id,
    },
    ...req.queryConfig,
  }, {
    throwIfKeyNotFound: true,
  })

  res.json({ tier: tiers[0] })
}

export const UpdateTierSchema = z.object({
  name: z.string(),
  promo_id: z.string().nullable(),
  tier_rules: z.array(z.object({
    min_purchase_value: z.number(),
    currency_code: z.string(),
  })),
})

type UpdateTierInput = z.infer<typeof UpdateTierSchema>

export async function POST(
  req: MedusaRequest<UpdateTierInput>,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params
  const { name, promo_id, tier_rules } = req.validatedBody

  const { result } = await updateTierWorkflow(req.scope).run({
    input: {
      id,
      name,
      promo_id: promo_id !== undefined ? promo_id : null,
      tier_rules: tier_rules || [],
    },
  })

  res.json({ tier: result.tier })
}

