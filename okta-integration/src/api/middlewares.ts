import { authenticate, defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http"
import validateOktaProvider from "./middlewares/validate-okta-provider"
import { CreateUserSchema } from "./okta/users/route"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/okta/users",
      methods: ["POST"],
      middlewares: [
        authenticate("user", "bearer", {
          allowUnregistered: true,
        }),
        validateAndTransformBody(CreateUserSchema),
        validateOktaProvider
      ],
    },
  ],
})