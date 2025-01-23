import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import jwt from "jsonwebtoken"

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

  const query = req.scope.resolve("query")

  const { data } = await query.graph({
    entity: "wishlist",
    fields: ["*"],
    filters: {
      customer_id: req.auth_context.actor_id,
    }
  })

  if (!data.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No wishlist found for customer"
    )
  }

  if (data[0].sales_channel_id !== req.publishable_key_context.sales_channel_ids[0]) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Wishlist does not belong to the specified sales channel"
    )
  }

  const { http } = req.scope.resolve("configModule").projectConfig

  const wishlistToken = jwt.sign({
    wishlist_id: data[0].id
  }, http.jwtSecret!, {
    expiresIn: http.jwtExpiresIn
  })

  return res.json({
    token: wishlistToken
  })
}