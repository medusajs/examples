import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { createWorkflow } from "@medusajs/framework/workflows-sdk";
import { QuoteStatus } from "../modules/quote/models/quote";
import { validateQuoteNotAccepted } from "./steps/validate-quote-not-accepted";
import { updateQuotesStep } from "./steps/update-quotes";

type WorkflowInput = {
  quote_id: string;
}

export const merchantRejectQuoteWorkflow = createWorkflow(
  "merchant-reject-quote-workflow",
  (input: WorkflowInput) => {
    const { data: quotes } = useQueryGraphStep({
      entity: "quote",
      fields: ["id", "status"],
      filters: { id: input.quote_id },
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
        status: QuoteStatus.MERCHANT_REJECTED,
      },
    ]);
  }
);
