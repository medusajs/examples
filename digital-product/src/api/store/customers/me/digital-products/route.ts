import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/medusa";
import { 
  remoteQueryObjectFromString
} from "@medusajs/utils"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const remoteQuery = req.scope.resolve("remoteQuery")

  const query = remoteQueryObjectFromString({
    entryPoint: "customer",
    fields: [
      "orders.digital_product_order.products.*",
      "orders.digital_product_order.products.medias.*"
    ],
    variables: {
      filters: {
        id: req.auth_context.actor_id,
      }
    }
  })

  const result = await remoteQuery(query)

  const digitalProducts = {}

  result[0].orders.forEach((order) => {
    order.digital_product_order.products.forEach((product) => {
      digitalProducts[product.id] = product
    })
  })

  res.json({
    digital_products: Object.values(digitalProducts)
  })
}
