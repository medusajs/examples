import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createWishlistWorkflow } from "../../../../../workflows/create-wishlist";
import { MedusaError } from "@medusajs/framework/utils";

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  if (!req.publishable_key_context?.sales_channel_ids.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "At least one sales channel ID is required to be associated with the publishable API key in the request header."
    )
  }
  const { result } = await createWishlistWorkflow(req.scope)
    .run({
      input: {
        customer_id: req.auth_context.actor_id,
        sales_channel_id: req.publishable_key_context?.sales_channel_ids[0]
      }
    })

  res.json({
    wishlist: result.wishlist
  })
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve("query")

  const { data } = await query.graph({
    entity: "wishlist",
    fields: ["*", "items.*", "items.product_variant.*"],
    filters: {
      customer_id: req.auth_context.actor_id
    }
  })

  if (!data.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No wishlist found for customer"
    )
  }

  return res.json({
    wishlist: data[0]
  })
}