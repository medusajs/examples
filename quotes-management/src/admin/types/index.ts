import {
  AdminCustomer,
  AdminOrder,
  AdminUser,
  FindParams,
  PaginatedResponse,
  StoreCart,
} from "@medusajs/framework/types";

export type AdminQuoteMessage = {
  id: string;
  text: string;
  quote_id: string;
  admin_id: string;
  customer_id: string;
  item_id: string;
  customer: AdminCustomer;
  admin: AdminUser;
};

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
  messages: AdminQuoteMessage[];
};

export interface QuoteQueryParams extends FindParams {}

/* Admin */
export type AdminQuoteResponse = {
  quote: AdminQuote;
};

export type AdminQuotesResponse = PaginatedResponse<{
  quotes: AdminQuote[];
}>;

export type AdminCreateQuoteMessage = {
  text: string;
  item_id?: string;
};