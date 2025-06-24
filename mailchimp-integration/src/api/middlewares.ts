import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http";
import { newsletterSignupSchema } from "./store/newsletter/route";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/newsletter",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(newsletterSignupSchema)
      ]
    }
  ]
})