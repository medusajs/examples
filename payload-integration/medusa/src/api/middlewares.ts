import { defineMiddlewares } from "@medusajs/framework/http"
import type { 
  MedusaNextFunction, 
  MedusaRequest, 
  MedusaResponse, 
} from "@medusajs/framework/http"
import { ConfigModule } from "@medusajs/framework"
import { parseCorsOrigins } from "@medusajs/framework/utils"
import cors from "cors"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/static*",
      middlewares: [
        (
          req: MedusaRequest, 
          res: MedusaResponse, 
          next: MedusaNextFunction
        ) => {
          console.log("CORS middleware for static files")
          const configModule: ConfigModule =
            req.scope.resolve("configModule")

          return cors({
            origin: parseCorsOrigins(
              configModule.projectConfig.http.storeCors
            ),
            credentials: true,
          })(req, res, next)
        },
      ],
    },
  ],
})