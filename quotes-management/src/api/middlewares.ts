import { defineMiddlewares } from "@medusajs/framework/http";
import { adminQuotesMiddlewares } from "./admin/quotes/middlewares";
import { storeQuotesMiddlewares } from "./store/quotes/middlewares";

export default defineMiddlewares({
  routes: [
    ...adminQuotesMiddlewares,
    ...storeQuotesMiddlewares
  ]
})