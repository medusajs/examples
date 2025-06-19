import { 
  defineMiddlewares, 
  errorHandler, 
  MedusaNextFunction, 
  MedusaRequest, 
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import * as Sentry from "@sentry/node"

const originalErrorHandler = errorHandler()

export default defineMiddlewares({
  errorHandler: (
    error: MedusaError | any, 
    req: MedusaRequest, 
    res: MedusaResponse, 
    next: MedusaNextFunction
  ) => {
    Sentry.captureException(error);
    return originalErrorHandler(error, req, res, next);
  },
})