import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { completeCartWithTicketsWorkflow } from "../../../../../workflows/complete-cart-with-tickets"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { result } = await completeCartWithTicketsWorkflow(req.scope).run({
    input: {
      cart_id: req.params.id
    }
  })

  res.json({
    type: "order",
    order: result.order,
  })
}
