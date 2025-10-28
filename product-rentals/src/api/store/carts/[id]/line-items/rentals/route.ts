import type { 
  MedusaRequest, 
  MedusaResponse
} from "@medusajs/framework/http"
import { 
  addToCartWithRentalWorkflow
} from "../../../../../../workflows/add-to-cart-with-rental"
import { z } from "zod"

export const PostCartItemsRentalsBody = z.object({
  variant_id: z.string(),
  quantity: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const POST = async (
  req: MedusaRequest<z.infer<typeof PostCartItemsRentalsBody>>,
  res: MedusaResponse
) => {
  const { id: cart_id } = req.params
  const { variant_id, quantity, metadata } = req.validatedBody

  const { result } = await addToCartWithRentalWorkflow(req.scope).run({
    input: {
      cart_id,
      variant_id,
      quantity,
      metadata,
    },
  })

  res.json({ cart: result.cart })
}

