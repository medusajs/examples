import { 
  defineMiddlewares, 
} from "@medusajs/medusa"
import { 
  validateAndTransformBody
} from "@medusajs/medusa/api/utils/validate-body"
import { createDigitalProductsSchema } from "./validation-schemas"
import multer from "multer"

const upload = multer({ storage: multer.memoryStorage() })

export default defineMiddlewares({
  routes: [
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