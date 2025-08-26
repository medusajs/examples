import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { removeProductBuilderFromCartWorkflow } from "../../../../../../workflows/remove-product-builder-from-cart"

export const DELETE = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const {
    id: cartId,
    item_id: lineItemId
  } = req.params

  const { result } = await removeProductBuilderFromCartWorkflow(req.scope)
    .run({
      input: {
        cart_id: cartId,
        line_item_id: lineItemId
      }
    })

  res.json({
    cart: result.cart,
  })
}
