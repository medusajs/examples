import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http";
import { UpsertPreorderVariantSchema } from "./admin/variants/[id]/preorders/route";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/variants/:id/preorders",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(UpsertPreorderVariantSchema)
      ]
    },
  ]
})