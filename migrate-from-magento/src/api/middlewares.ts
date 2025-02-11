import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http";
import { z } from "zod"

export const AdminMagentoMigrationsPost = z.object({
  type: z.enum(["category", "product"]).array()
})

console.log("here")

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/magento/migrations",
      method: "POST",
      middlewares: [
        validateAndTransformBody(AdminMagentoMigrationsPost)
      ]
    }
  ]
})