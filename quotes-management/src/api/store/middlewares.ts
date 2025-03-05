import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http";
import { MiddlewareRoute } from "@medusajs/medusa";
import {
  listQuotesTransformQueryConfig,
} from "./customers/me/quotes/query-config";
import {
  CreateQuote,
  GetQuoteParams,
} from "./validators";

export const storeQuotesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/store/customers/me/quotes",
    middlewares: [
      validateAndTransformBody(CreateQuote),
    ],
  },
  {
    matcher: "/store/customers/me/quotes*",
    middlewares: [
      validateAndTransformQuery(GetQuoteParams, listQuotesTransformQueryConfig),
    ],
  },
];
