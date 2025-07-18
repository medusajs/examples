import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { completeCartPreorderWorkflow } from "../../../../../workflows/complete-cart-preorder";

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params

  const { result } = await completeCartPreorderWorkflow(req.scope).run({
    input: {
      cart_id: id,
    }
  })

  res.json({
    type: "order",
    order: result.order,
  })
}