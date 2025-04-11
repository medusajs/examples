import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { applyLoyaltyOnCartWorkflow } from "../../../../../workflows/apply-loyalty-on-cart";
import { removeLoyaltyFromCartWorkflow } from "../../../../../workflows/remove-loyalty-from-cart";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id: cart_id } = req.params

  const { result: cart } = await applyLoyaltyOnCartWorkflow(req.scope)
    .run({
      input: {
        cart_id
      }
    })

  res.json({ cart })
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id: cart_id } = req.params

  const { result: cart } = await removeLoyaltyFromCartWorkflow(req.scope)
    .run({
      input: {
        cart_id
      }
    })

  res.json({ cart })
}
