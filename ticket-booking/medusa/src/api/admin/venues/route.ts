import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createVenueWorkflow } from "../../../workflows/create-venue"
import { RowType } from "../../../modules/ticket-booking/models/venue-row"
import { z } from "zod"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve("query")

  const { 
    data: venues,
    metadata
  } = await query.graph({
    entity: "venue",
    ...req.queryConfig,
  })

  res.json({ 
    venues,
    count: metadata?.count,
    limit: metadata?.take,
    offset: metadata?.skip,
  })
}

export const CreateVenueSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  rows: z.array(z.object({
    row_number: z.string(),
    row_type: z.nativeEnum(RowType),
    seat_count: z.number()
  }))
})

type CreateVenueSchema = z.infer<typeof CreateVenueSchema>

export async function POST(
  req: MedusaRequest<CreateVenueSchema>,
  res: MedusaResponse
) {
  const { result } = await createVenueWorkflow(req.scope).run({
    input: req.validatedBody
  })

  res.json(result)
}
