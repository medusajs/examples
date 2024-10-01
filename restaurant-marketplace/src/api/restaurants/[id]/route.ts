import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { 
  QueryContext,
  ContainerRegistrationKeys
} from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(
    ContainerRegistrationKeys.QUERY
  );

  const restaurantId = req.params.id;

  const { data: [restaurant] } = await query.graph({
    entity: "restaurants",
    fields: [
      "*",
      "products.*",
      "products.categories.*",
      "products.categories.*",
      "products.variants.*",
      "products.variants.calculated_price.*",
      "deliveries.*",
      "deliveries.cart.*",
      "deliveries.cart.items.*",
      "deliveries.order.*",
      "deliveries.order.items.*",
    ],
    filters: {
      id: restaurantId
    },
    context: {
      products: {
        variants: {
          calculated_price: QueryContext({
            currency_code: "eur"
          })
        }
      }
    },
  });

  return res.status(200).json({ restaurant });
}
