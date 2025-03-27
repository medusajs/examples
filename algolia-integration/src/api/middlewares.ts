import { 
  defineMiddlewares,
  validateAndTransformBody 
} from "@medusajs/framework/http"
import { SearchSchema } from "./store/products/search/route"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/products/search",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(SearchSchema)
      ]
    }
  ]
})
