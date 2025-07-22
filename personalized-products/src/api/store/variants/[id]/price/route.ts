import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getCustomPriceWorkflow } from "../../../../../workflows/get-custom-price";
import { z } from "zod";

export const PostCustomPriceSchema = z.object({
  region_id: z.string(),
  metadata: z.object({
    height: z.number(),
    width: z.number(),
  }),
})

type PostCustomPriceSchemaType = z.infer<typeof PostCustomPriceSchema>

export async function POST(
  req: MedusaRequest<PostCustomPriceSchemaType>,
  res: MedusaResponse
) {
  const { id: variantId } = req.params
  const { 
    region_id,
    metadata
  } = req.validatedBody

  const { result: price } = await getCustomPriceWorkflow(req.scope).run({
    input: {
      variant_id: variantId,
      region_id,
      metadata
    }
  })

  res.json({
    price
  })
}
