import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http";
import { PostCustomPriceSchema } from "./store/variants/[id]/price/route";
import { PostAddCustomLineItemSchema } from "./store/carts/[id]/line-items-custom/route";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/variants/:id/price",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(PostCustomPriceSchema)
      ]
    },
    {
      matcher: "/store/carts/:id/line-items-custom",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(PostAddCustomLineItemSchema)
      ]
    }
  ]
})