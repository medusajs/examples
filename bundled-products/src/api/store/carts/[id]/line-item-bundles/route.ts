import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";
import { addBundleToCartWorkflow } from "../../../../../workflows/add-bundle-to-cart";

export const PostCartsBundledLineItemsSchema = z.object({
  bundle_id: z.string(),
  quantity: z.number().default(1),
  items: z.array(z.object({
    item_id: z.string(),
    variant_id: z.string()
  }))
})

type PostCartsBundledLineItemsSchema = z.infer<typeof PostCartsBundledLineItemsSchema>

export async function POST(
  req: MedusaRequest<PostCartsBundledLineItemsSchema>,
  res: MedusaResponse
) {
  const { result: cart } = await addBundleToCartWorkflow(req.scope)
    .run({
      input: {
        cart_id: req.params.id,
        bundle_id: req.validatedBody.bundle_id,
        quantity: req.validatedBody.quantity || 1,
        items: req.validatedBody.items
      }
    })

  res.json({
    cart
  })
}
