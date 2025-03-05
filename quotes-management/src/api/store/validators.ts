import {
  createFindParams,
} from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";

export type GetQuoteParamsType = z.infer<typeof GetQuoteParams>;
export const GetQuoteParams = createFindParams({
  limit: 15,
  offset: 0,
})

export type CreateQuoteType = z.infer<typeof CreateQuote>;
export const CreateQuote = z
  .object({
    cart_id: z.string().min(1),
  })
  .strict();