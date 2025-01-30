import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { HttpTypes } from "@medusajs/framework/types"
import { addCustomToCartWorkflow } from "../../../../../workflows/add-custom-to-cart"

export const POST = async (
  req: MedusaRequest<HttpTypes.StoreAddCartLineItem>, 
  res: MedusaResponse
) => {
  const { id } = req.params
  const item = req.validatedBody

  const { result } = await addCustomToCartWorkflow(req.scope)
    .run({
      input: {
        cart_id: id,
        item
      }
    })

  res.status(200).json({ cart: result.cart })
}