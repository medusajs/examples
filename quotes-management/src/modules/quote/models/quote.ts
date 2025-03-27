import { model } from "@medusajs/framework/utils";

export enum QuoteStatus {
  PENDING_MERCHANT = "pending_merchant",
  PENDING_CUSTOMER = "pending_customer",
  ACCEPTED = "accepted",
  CUSTOMER_REJECTED = "customer_rejected",
  MERCHANT_REJECTED = "merchant_rejected",
}

export const Quote = model.define("quote", {
  id: model.id().primaryKey(),
  status: model
    .enum(Object.values(QuoteStatus))
    .default(QuoteStatus.PENDING_MERCHANT),
  customer_id: model.text(),
  draft_order_id: model.text(),
  order_change_id: model.text(),
  cart_id: model.text(),
});
