import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { addProductBuilderToCartWorkflow } from "../../../../../workflows/add-product-builder-to-cart"
import { z } from "zod"

export const AddBuilderProductSchema = z.object({
  product_id: z.string(),
  variant_id: z.string(),
  quantity: z.number().optional().default(1),
  custom_field_values: z.record(z.any()).optional().default({}),
  complementary_product_variants: z.array(z.string()).optional().default([]),
  addon_variants: z.array(z.string()).optional().default([]),
})

export async function POST(
  req: MedusaRequest<
    z.infer<typeof AddBuilderProductSchema>
  >,
  res: MedusaResponse
) {

  const cartId = req.params.id

  const { result } = await addProductBuilderToCartWorkflow(req.scope).run({
    input: {
      cart_id: cartId,
      ...req.validatedBody,
    }
  })

  res.json({
    cart: result.cart,
  })
}
