import { 
  defineMiddlewares, 
  validateAndTransformBody,
  errorHandler,
} from "@medusajs/framework/http";
import { validateAgenticRequest } from "./middlewares/validate-agentic-request";
import { PostCreateSessionSchema } from "./checkout_sessions/route";
import { PostCompleteSessionSchema } from "./checkout_sessions/[id]/complete/route";
import { PostUpdateSessionSchema } from "./checkout_sessions/[id]/route";

const originalErrorHandler = errorHandler()

export default defineMiddlewares({
  errorHandler: (error, req, res, next) => {
    if (!req.path.startsWith("/checkout_sessions")) {
      return originalErrorHandler(error, req, res, next)
    }

    res.json({
      messages: [
        {
          type: "error",
          code: "invalid",
          content_type: "plain",
          content: error.message,
        }
      ]
    })
  },
  routes: [
    {
      matcher: "/checkout_sessions*",
      middlewares: [
        validateAgenticRequest
      ]
    },
    {
      matcher: "/checkout_sessions",
      method: ["POST"],
      middlewares: [validateAndTransformBody(PostCreateSessionSchema)]
    },
    {
      matcher: "/checkout_sessions/:id",
      method: ["POST"],
      middlewares: [validateAndTransformBody(PostUpdateSessionSchema)]
    },
    {
      matcher: "/checkout_sessions/:id/complete",
      method: ["POST"],
      middlewares: [validateAndTransformBody(PostCompleteSessionSchema)]
    }
  ]
})