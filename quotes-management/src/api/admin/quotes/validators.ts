import {
  createFindParams,
} from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";

export const AdminGetQuoteParams = createFindParams({
  limit: 15,
  offset: 0,
})
  .strict();

export type AdminSendQuoteType = z.infer<typeof AdminSendQuote>;
export const AdminSendQuote = z.object({}).strict();

export type AdminRejectQuoteType = z.infer<typeof AdminRejectQuote>;
export const AdminRejectQuote = z.object({}).strict();
