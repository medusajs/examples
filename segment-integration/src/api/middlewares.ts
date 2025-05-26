import { 
  defineMiddlewares,
  authenticate,
} from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/products/:id/viewed",
      middlewares: [
        authenticate("customer", ["session", "bearer"], {
          allowUnauthenticated: true
        })
      ],
    },
  ],
})
