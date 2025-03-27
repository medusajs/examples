import { 
  defineMiddlewares,
  authenticate,
  validateAndTransformBody, 
  validateAndTransformQuery
} from "@medusajs/framework/http"
import { PostAdminUpdateReviewsStatusSchema } from "./admin/reviews/status/route"
import { PostStoreReviewSchema } from "./store/reviews/route"
import { GetStoreReviewsSchema } from "./store/products/[id]/reviews/route"
import { GetAdminReviewsSchema } from "./admin/reviews/route"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/reviews",
      method: ["POST"], 
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        validateAndTransformBody(PostStoreReviewSchema)
      ]
    }, 
    {
      matcher: "/store/products/:id/reviews",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetStoreReviewsSchema, {
          isList: true,
          defaults: ["id", "rating", "title", "first_name", "last_name", "content", "created_at"]
        })
      ]
    },
    {
      matcher: "/admin/reviews",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetAdminReviewsSchema, {
          isList: true,
          defaults: [
            "id",
            "title",
            "content",
            "rating",
            "product_id",
            "customer_id",
            "status",
            "created_at",
            "updated_at",
            "product.*",
          ]
        })
      ]
    },
    {
      matcher: "/admin/reviews/status",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(PostAdminUpdateReviewsStatusSchema)
      ]
    }
  ]
})


