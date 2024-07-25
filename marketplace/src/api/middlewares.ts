import { defineMiddlewares, authenticate } from "@medusajs/medusa"
import { validateAndTransformBody } from "@medusajs/medusa/dist/api/utils/validate-body"
import { AdminCreateProduct } from "@medusajs/medusa/dist/api/admin/products/validators"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/vendors",
      method: "POST",
      middlewares: [
        authenticate("vendor", ["session", "bearer"], {
          allowUnregistered: true,
        }),
      ],
    },
    {
      matcher: "/vendors/*",
      middlewares: [
        authenticate("vendor", ["session", "bearer"]),
      ]
    },
    {
      matcher: "/vendors/products",
      method: "POST",
      middlewares: [
        authenticate("vendor", ["session", "bearer"]),
        validateAndTransformBody(AdminCreateProduct),
      ]
    }
  ],
}
)