import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { createWorkflow } from "@medusajs/framework/workflows-sdk";
import { QuoteStatus } from "../modules/quote/models/quote";
import { updateQuotesStep } from "./steps/update-quotes";
import { validateQuoteNotAccepted } from "./steps/validate-quote-not-accepted";

type WorkflowInput = {
  quote_id: string;
  customer_id: string;
}

export const customerRejectQuoteWorkflow = createWorkflow(
  "customer-reject-quote-workflow",
  (input: WorkflowInput) => {
    const { data: quotes } = useQueryGraphStep({
      entity: "quote",
      fields: ["id", "status"],
      filters: { id: input.quote_id, customer_id: input.customer_id },
      options: {
        throwIfKeyNotFound: true,
      }
    });

    validateQuoteNotAccepted({ 
      // @ts-ignore
      quote: quotes[0]
    });

    updateQuotesStep([
      {
        id: input.quote_id,
        status: QuoteStatus.CUSTOMER_REJECTED,
      },
    ]);
  }
);
