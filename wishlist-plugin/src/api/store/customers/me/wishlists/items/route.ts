import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { createWishlistItemWorkflow } from "../../../../../../workflows/create-wishlist-item"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"
import { PostStoreCreateWishlistItem } from "./validators"

type PostStoreCreateWishlistItemType = z.infer<typeof PostStoreCreateWishlistItem>

export async function POST (
  req: AuthenticatedMedusaRequest<PostStoreCreateWishlistItemType>,
  res: MedusaResponse
) {
  if (!req.publishable_key_context?.sales_channel_ids.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "At least one sales channel ID is required to be associated with the publishable API key in the request header."
    )
  }
  const { result } = await createWishlistItemWorkflow(req.scope)
    .run({
      input: {
        variant_id: req.validatedBody.variant_id,
        customer_id: req.auth_context.actor_id,
        sales_channel_id: req.publishable_key_context?.sales_channel_ids[0]
      }
    })

  res.json({
    wishlist: result.wishlist
  })
}