import { defineMiddlewares, validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework"
import { CreateCategoryImagesSchema } from "./admin/categories/[category_id]/images/route"
import { createSelectParams } from "@medusajs/medusa/api/utils/validators"
import { DeleteCategoryImagesSchema, UpdateCategoryImagesSchema } from "./admin/categories/[category_id]/images/batch/route"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/categories/:category_id/images",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(CreateCategoryImagesSchema)
      ]
    },
    {
      matcher: "/admin/categories/:category_id/images/:id",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(createSelectParams(), {
          isList: false,
          defaults: ["id", "type", "url", "file_id"],
        })
      ]
    },
    {
      matcher: "/admin/categories/:category_id/images/batch",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(UpdateCategoryImagesSchema)
      ]
    },
    {
      matcher: "/admin/categories/:category_id/images/batch",
      method: ["DELETE"],
      middlewares: [
        validateAndTransformBody(DeleteCategoryImagesSchema)
      ]
    }
  ],
})