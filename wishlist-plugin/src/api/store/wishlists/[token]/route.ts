import { MedusaResponse, MedusaStoreRequest } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import { decode, JwtPayload } from "jsonwebtoken"

export async function GET(
  req: MedusaStoreRequest,
  res: MedusaResponse
) {
  if (!req.publishable_key_context?.sales_channel_ids.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "At least one sales channel ID is required to be associated with the publishable API key in the request header."
    )
  }
  
  const decodedToken = decode(req.params.token) as JwtPayload

  if (!decodedToken.wishlist_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Invalid token"
    )
  }

  const query = req.scope.resolve("query")

  const { data } = await query.graph({
    entity: "wishlist",
    fields: ["*", "items.*", "items.product_variant.*"],
    filters: {
      id: decodedToken.wishlist_id
    }
  })

  if (!data.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No wishlist found"
    )
  }

  if (data[0].sales_channel_id !== req.publishable_key_context.sales_channel_ids[0]) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Wishlist does not belong to the request's sales channel"
    )
  }

  res.json({
    wishlist: data[0]
  })
}