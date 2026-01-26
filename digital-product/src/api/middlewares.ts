import { 
  validateAndTransformBody,
  validateAndTransformQuery,
  defineMiddlewares, 
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { createDigitalProductsSchema } from "./validation-schemas"
import multer from "multer"

const upload = multer({ storage: multer.memoryStorage() })

const GetDigitalProductsSchema = createFindParams()

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/digital-products",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(
          GetDigitalProductsSchema,
          {
            defaults: [
              "id",
              "name",
              "created_at",
              "updated_at",
              "deleted_at",
              "medias.*",
              "product_variant.*",
            ],
            isList: true,
          }
        ),
      ],
    },
    {
      matcher: "/admin/digital-products",
      method: "POST",
      middlewares: [
        validateAndTransformBody(createDigitalProductsSchema),
      ],
    },
    {
      matcher: "/admin/digital-products/upload**",
      method: "POST",
      middlewares: [
        upload.array("files"),
      ]
    }
  ],
})