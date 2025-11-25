import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { CreateTierSchema } from "./admin/tiers/route"
import { UpdateTierSchema } from "./admin/tiers/[id]/route"
import { NextTierSchema } from "./store/customers/me/next-tier/route"

export default defineMiddlewares({
  routes: [
    // GET /admin/tiers - List tiers
    {
      matcher: "/admin/tiers",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          isList: true,
          defaults: ["id", "name", "promotion.id", "promotion.code"],
        }),
      ],
    },
    // POST /admin/tiers - Create tier
    {
      matcher: "/admin/tiers",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(CreateTierSchema)],
    },
    // GET /admin/tiers/:id - Get tier
    {
      matcher: "/admin/tiers/:id",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          isList: false,
          defaults: ["id", "name", "promotion.id", "promotion.code", "tier_rules.*"],
        }),
      ],
    },
    // POST /admin/tiers/:id - Update tier
    {
      matcher: "/admin/tiers/:id",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(UpdateTierSchema)],
    },
    // GET /admin/tiers/:id/customers - List customers in tier
    {
      matcher: "/admin/tiers/:id/customers",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          isList: true,
          defaults: ["id", "email", "first_name", "last_name"],
        }),
      ],
    },
    {
      matcher: "/store/customers/me/next-tier",
      methods: ["GET"],
      middlewares: [validateAndTransformQuery(NextTierSchema, {})],
    },
    {
      matcher: "/admin/customers*",
      methods: ["GET"],
      middlewares: [
        (req, res, next) => {
          (req.allowed ??= []).push("tier")
          next()
        },
      ],
    },
  ],
})

