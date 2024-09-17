import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse,
} from "@medusajs/medusa"
import { 
  ContainerRegistrationKeys,
} from "@medusajs/utils"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [customer] } = await query.graph({
    entity: "customer",
    fields: [
      "orders.digital_product_order.products.*",
      "orders.digital_product_order.products.medias.*",
    ],
    filters: {
      id: req.auth_context.actor_id,
    },
  })

  const digitalProducts = {}

  customer.orders.forEach((order) => {
    order.digital_product_order.products.forEach((product) => {
      digitalProducts[product.id] = product
    })
  })

  res.json({
    digital_products: Object.values(digitalProducts),
  })
}