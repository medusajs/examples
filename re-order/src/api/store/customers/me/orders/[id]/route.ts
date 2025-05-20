import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { reorderWorkflow } from "../../../../../../workflows/reorder";

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params

  const { result } = await reorderWorkflow(req.scope).run({
    input: {
      order_id: id,
    },
  })

  return res.json({
    cart: result,
  })
}