import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateRentalWorkflow } from "../../../../workflows/update-rental"
import { z } from "zod"

export const PostRentalStatusBodySchema = z.object({
  status: z.enum(["active", "returned", "cancelled"]),
})

export const POST = async (
  req: MedusaRequest<z.infer<typeof PostRentalStatusBodySchema>>,
  res: MedusaResponse
) => {
  const { id } = req.params
  const { status } = req.validatedBody

  const { result } = await updateRentalWorkflow(req.scope).run({
    input: {
      rental_id: id,
      status,
    },
  })

  res.json({ rental: result })
}
