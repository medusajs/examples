import { authenticate, defineMiddlewares } from "@medusajs/medusa";
import deliveriesMiddlewares from "./deliveries/[id]/middlewares"

export default defineMiddlewares({
  routes: [
    {
      method: ["POST"],
      matcher: "/users",
      middlewares: [
        authenticate(["driver", "restaurant"], "bearer", {
          allowUnregistered: true,
        }),
      ],
    },
    {
      method: ["POST", "DELETE"],
      matcher: "/restaurants/:id/**",
      middlewares: [
        authenticate(["restaurant", "admin"], "bearer"),
      ],
    },
    ...deliveriesMiddlewares.routes
  ],
})