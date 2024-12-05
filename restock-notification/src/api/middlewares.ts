import { authenticate, defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http";
import { PostStoreCreateRestockSubscription } from "./store/restock-subscriptions/validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/restock-subscriptions",
      method: "POST",
      middlewares: [
        authenticate("customer", ["bearer", "session"], {
          allowUnauthenticated: true
        }),
        validateAndTransformBody(PostStoreCreateRestockSubscription)
      ]
    }
  ]
})