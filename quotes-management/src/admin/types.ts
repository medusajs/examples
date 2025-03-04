import {
  AdminCustomer,
  AdminOrder,
  FindParams,
  PaginatedResponse,
  StoreCart,
} from "@medusajs/framework/types";

export type AdminQuote = {
  id: string;
  status: string;
  draft_order_id: string;
  order_change_id: string;
  cart_id: string;
  customer_id: string;
  created_at: string;
  updated_at: string;
  draft_order: AdminOrder;
  cart: StoreCart;
  customer: AdminCustomer
};

export interface QuoteQueryParams extends FindParams {}

export type AdminQuoteResponse = {
  quote: AdminQuote;
};

export type AdminQuotesResponse = PaginatedResponse<{
  quotes: AdminQuote[];
}>;
