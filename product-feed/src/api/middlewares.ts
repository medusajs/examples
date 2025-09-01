import { defineMiddlewares, validateAndTransformQuery } from '@medusajs/framework/http';
import { z } from 'zod';

export default defineMiddlewares({
  routes: [
    {
      matcher: "/product-feed",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(z.object({
          currency_code: z.string(),
          country_code: z.string(),
        }), {})
      ]
    }
  ]
})