import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { upsertProductVariantPreorderWorkflow } from "../../../../../workflows/upsert-product-variant-preorder"
import { disablePreorderVariantWorkflow } from "../../../../../workflows/disable-preorder-variant"

export const UpsertPreorderVariantSchema = z.object({
  available_date: z.string().datetime()
})

type UpsertPreorderVariantSchema = z.infer<
  typeof UpsertPreorderVariantSchema
>

export const POST = async (
  req: AuthenticatedMedusaRequest<UpsertPreorderVariantSchema>,
  res: MedusaResponse
) => {
  const variantId = req.params.id

  const { result } = await upsertProductVariantPreorderWorkflow(req.scope)
    .run({
      input: {
        variant_id: variantId,
        available_date: new Date(req.validatedBody.available_date)
      }
    })

  res.json({
    preorder_variant: result
  })
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const variantId = req.params.id

  const { result } = await disablePreorderVariantWorkflow(req.scope).run({
    input: {
      variant_id: variantId
    }
  })

  res.json({
    preorder_variant: result
  })
}