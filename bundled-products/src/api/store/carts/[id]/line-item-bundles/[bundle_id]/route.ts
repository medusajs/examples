import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { removeBundleFromCartWorkflow } from "../../../../../../workflows/remove-bundle-from-cart";

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { result: cart } = await removeBundleFromCartWorkflow(req.scope)
    .run({
      input: {
        cart_id: req.params.id,
        bundle_id: req.params.bundle_id,
      }
    })

  res.json({
    cart
  })
}
