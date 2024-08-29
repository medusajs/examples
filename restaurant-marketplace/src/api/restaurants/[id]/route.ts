import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { RemoteQueryFunction } from "@medusajs/modules-sdk";
import {
  ContainerRegistrationKeys,
  remoteQueryObjectFromString,
} from "@medusajs/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const remoteQuery: RemoteQueryFunction = req.scope.resolve(
    ContainerRegistrationKeys.REMOTE_QUERY
  );

  const restaurantId = req.params.id;

  const restaurantQuery = remoteQueryObjectFromString({
    entryPoint: "restaurants",
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
    variables: {
      filters: {
        id: restaurantId
      },
      "products.variants.calculated_price": {
        context: {
          currency_code: "eur"
        }
      }
    },
  });

  const restaurant = await remoteQuery(restaurantQuery).then((r) => r[0]);

  return res.status(200).json({ restaurant });
}
