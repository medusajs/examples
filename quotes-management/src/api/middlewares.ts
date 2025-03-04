import { defineMiddlewares } from "@medusajs/framework/http";
import { adminQuotesMiddlewares } from "./admin/quotes/middlewares";
import { storeQuotesMiddlewares } from "./store/middlewares";

export default defineMiddlewares({
  routes: [
    ...adminQuotesMiddlewares,
    ...storeQuotesMiddlewares
  ]
})