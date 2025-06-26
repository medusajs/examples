import {
  beginOrderEditOrderWorkflow,
  createOrderWorkflow,
  CreateOrderWorkflowInput,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows";
import { OrderStatus } from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { CreateOrderLineItemDTO } from "@medusajs/framework/types";
import { createQuotesStep } from "./steps/create-quotes";

type WorkflowInput = {
  cart_id: string;
  customer_id: string;
};

export const createRequestForQuoteWorkflow = createWorkflow(
  "create-request-for-quote",
  (input: WorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: [
        "id",
        "sales_channel_id",
        "currency_code",
        "region_id",
        "customer.id",
        "customer.email",
        "shipping_address.*",
        "billing_address.*",
        "items.*",
        "shipping_methods.*",
        "promotions.code",
      ],
      filters: { id: input.cart_id },
      options: {
        throwIfKeyNotFound: true,
      }
    });

    const { data: customers } = useQueryGraphStep({
      entity: "customer",
      fields: ["id", "customer"],
      filters: { id: input.customer_id },
      options: {
        throwIfKeyNotFound: true
      }
    }).config({ name: "customer-query" });

    const orderInput = transform({ carts, customers }, ({ carts, customers }) => {
      return {
        is_draft_order: true,
        status: OrderStatus.DRAFT,
        sales_channel_id: carts[0].sales_channel_id || undefined,
        email: customers[0].email || undefined,
        customer_id: customers[0].id || undefined,
        billing_address: carts[0].billing_address,
        shipping_address: carts[0].shipping_address,
        items: carts[0].items as CreateOrderLineItemDTO[] || [],
        region_id: carts[0].region_id || undefined,
        promo_codes: carts[0].promotions?.map((promo) => promo?.code),
        currency_code: carts[0].currency_code,
        shipping_methods: carts[0].shipping_methods || [],
      } as CreateOrderWorkflowInput;
    });

    const draftOrder = createOrderWorkflow.runAsStep({
      input: orderInput,
    });

    const orderEditInput = transform({ draftOrder }, ({ draftOrder }) => {
      return {
        order_id: draftOrder.id,
        description: "",
        internal_note: "",
        metadata: {},
      };
    });

    const changeOrder = beginOrderEditOrderWorkflow.runAsStep({
      input: orderEditInput,
    });

    const quoteData = transform({
      draftOrder,
      carts,
      customers,
      changeOrder,
    }, ({ draftOrder, carts, customers, changeOrder }) => {
      return {
        draft_order_id: draftOrder.id,
        cart_id: carts[0].id,
        customer_id: customers[0].id,
        order_change_id: changeOrder.id,
      }
    })

    const quotes = createQuotesStep([
      quoteData
    ])

    return new WorkflowResponse({ quote: quotes[0] });
  }
);
