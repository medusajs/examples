import { 
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { StoreAddCartLineItem } from "@medusajs/medusa/api/store/carts/validators"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/carts/:id/line-items-metals",
      method: "POST",
      middlewares: [
        validateAndTransformBody(
          StoreAddCartLineItem,
        )
      ]
    }
  ],
})