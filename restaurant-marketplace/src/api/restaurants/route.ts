import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { 
  MedusaError, 
  ContainerRegistrationKeys,
  QueryContext
} from "@medusajs/framework/utils";
import { createRestaurantWorkflow } from "../../workflows/restaurant/workflows/create-restaurant";
import { restaurantSchema } from "./validation-schemas";
import { CreateRestaurant } from "../../modules/restaurant/types";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const validatedBody = restaurantSchema.parse(req.body) as CreateRestaurant;

  if (!validatedBody) {
    return MedusaError.Types.INVALID_DATA;
  }

  const { result: restaurant } = await createRestaurantWorkflow(req.scope).run({
    input: {
      restaurant: validatedBody,
    },
  });

  return res.status(200).json({ restaurant });
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { currency_code = "eur", ...queryFilters } = req.query;

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: restaurants } = await query.graph({
    entity: "restaurants",
    fields: [
      "id",
      "handle",
      "name",
      "address",
      "phone",
      "email",
      "image_url",
      "is_open",
      "products.*",
      "products.categories.*",
      "products.variants.*",
      "products.variants.calculated_price.*"
    ],
    filters: queryFilters,
    context: {
      products: {
        variants: {
          calculated_price: QueryContext({
            currency_code
          })
        }
      }
    },
  });

  return res.status(200).json({ restaurants });
}
