import {
  confirmOrderEditRequestWorkflow,
  updateOrderWorkflow,
  useQueryGraphStep,
} from "@medusajs/core-flows";
import { OrderStatus } from "@medusajs/framework/utils";
import { createWorkflow } from "@medusajs/workflows-sdk";
import { validateQuoteAcceptanceStep } from "./steps/validate-quote-acceptance";
import { updateQuotesWorkflow } from "./update-quote";
import { QuoteStatus } from "../modules/quote/models/quote";

type WorkflowInput = {
  quote_id: string;
  customer_id: string;
};

export const customerAcceptQuoteWorkflow = createWorkflow(
  "customer-accept-quote-workflow",
  (input: WorkflowInput) => {
    // @ts-ignore
    const { data: quotes } = useQueryGraphStep({
      entity: "quote",
      fields: ["id", "draft_order_id", "status"],
      filters: { id: input.quote_id },
      options: {
        throwIfKeyNotFound: true,
      }
    });

    validateQuoteAcceptanceStep({ 
      // @ts-ignore
      quote: quotes[0]
    });

    updateQuotesWorkflow.runAsStep({
      input: [{ id: input.quote_id, status: QuoteStatus.ACCEPTED }],
    });

    confirmOrderEditRequestWorkflow.runAsStep({
      input: {
        order_id: quotes[0].draft_order_id,
        confirmed_by: input.customer_id,
      },
    });

    updateOrderWorkflow.runAsStep({
      input:{ 
        id: quotes[0].draft_order_id,
        // @ts-ignore
        status: OrderStatus.PENDING,
        is_draft_order: false
      }
    })
  }
);
