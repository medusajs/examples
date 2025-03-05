import {
  createFindParams,
} from "@medusajs/medusa/api/utils/validators";

export const AdminGetQuoteParams = createFindParams({
  limit: 15,
  offset: 0,
})
  .strict();