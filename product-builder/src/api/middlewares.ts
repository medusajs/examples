import { 
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery
} from "@medusajs/framework/http"
import { UpsertProductBuilderSchema } from "./admin/products/[id]/builder/route";
import { AddBuilderProductSchema } from "./store/carts/[id]/product-builder/route";
import { GetComplementaryProductsSchema } from "./admin/products/complementary/route";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/products/:id/builder",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(UpsertProductBuilderSchema)
      ]
    },
    {
      matcher: "/admin/products/complementary",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetComplementaryProductsSchema, {
          isList: true
        })
      ]
    },
    {
      matcher: "/admin/products/addons",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          isList: true
        })
      ]
    },
    {
      matcher: "/store/carts/:id/product-builder",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(AddBuilderProductSchema)
      ]
    },
  ]
})
