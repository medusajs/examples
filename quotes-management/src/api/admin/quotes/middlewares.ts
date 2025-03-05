import {
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import {
  listQuotesTransformQueryConfig,
} from "./query-config";
import {
  AdminGetQuoteParams,
} from "./validators";

export const adminQuotesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/quotes*",
    middlewares: [
      validateAndTransformQuery(
        AdminGetQuoteParams,
        listQuotesTransformQueryConfig
      ),
    ],
  },
];
