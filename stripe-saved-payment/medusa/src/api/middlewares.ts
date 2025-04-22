import { authenticate, defineMiddlewares } from "@medusajs/framework/http";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/payment-methods/:provider_id/:account_holder_id",
      method: "GET",
      middlewares: [
        authenticate("customer", ["bearer", "session"])
      ]
    }
  ]
})