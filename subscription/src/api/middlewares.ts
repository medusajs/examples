import { 
  validateAndTransformQuery,
  defineMiddlewares,
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"

export const GetCustomSchema = createFindParams()

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/subscriptions",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(
          GetCustomSchema,
          {
            defaults: [
              "id",
              "subscription_date",
              "expiration_date",
              "status",
              "metadata.*",
              "orders.*",
              "customer.*",
            ],
            isList: true,
          }
        ),
      ],
    },
  ],
})