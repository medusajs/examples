import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import { decode, JwtPayload } from "jsonwebtoken"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
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

  res.json({
    wishlist: data[0]
  })
}