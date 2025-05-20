import { defineMiddlewares } from "@medusajs/framework";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/customers/me",
      method: ["POST"],
      middlewares: [
        async (req, res, next) => {
          const { phone } = req.body as Record<string, string>

          if (phone) {
            return res.status(400).json({
              error: "Phone number is not allowed to be updated"
            })
          }

          next()
        }
      ]
    }
  ]
})