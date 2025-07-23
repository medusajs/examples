import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";
import { customAddToCartWorkflow } from "../../../../../workflows/custom-add-to-cart";

export const PostAddCustomLineItemSchema = z.object({
  variant_id: z.string(),
  quantity: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

type PostAddCustomLineItemSchemaType = z.infer<typeof PostAddCustomLineItemSchema>;

export async function POST(
  req: MedusaRequest<PostAddCustomLineItemSchemaType>,
  res: MedusaResponse
) {
  const { id: cartId } = req.params;
  const { result: cart } = await customAddToCartWorkflow(req.scope).run({
    input: {
      item: {
        variant_id: req.validatedBody.variant_id,
        quantity: req.validatedBody.quantity,
        metadata: req.validatedBody.metadata,
      },
      cart_id: cartId,
    },
  });

  res.json({
    cart
  });
}