import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { upsertRentalConfigWorkflow } from "../../../../../workflows/upsert-rental-config"
import { z } from "zod"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const query = req.scope.resolve("query")

  // Query rental configuration for the product
  const { data: rentalConfigs } = await query.graph({
    entity: "rental_configuration",
    fields: ["*"],
    filters: { product_id: id },
  })

  res.json({ rental_config: rentalConfigs[0] })
}

export const PostRentalConfigBodySchema = z.object({
  min_rental_days: z.number().optional(),
  max_rental_days: z.number().nullable().optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export const POST = async (
  req: MedusaRequest<z.infer<typeof PostRentalConfigBodySchema>>,
  res: MedusaResponse
) => {
  const { id } = req.params

  const { result } = await upsertRentalConfigWorkflow(req.scope).run({
    input: {
      product_id: id,
      min_rental_days: req.validatedBody.min_rental_days,
      max_rental_days: req.validatedBody.max_rental_days,
      status: req.validatedBody.status
    },
  })

  res.json({ rental_config: result })
}

