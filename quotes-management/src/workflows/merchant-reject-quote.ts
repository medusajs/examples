import { useQueryGraphStep } from "@medusajs/core-flows";
import { createWorkflow } from "@medusajs/workflows-sdk";
import { QuoteStatus } from "../modules/quote/models/quote";
import { validateQuoteRejectionStep } from "./steps/validate-quote-rejection";
import { updateQuotesWorkflow } from "./update-quote";

type WorkflowInput = {
  quote_id: string;
}

export const merchantRejectQuoteWorkflow = createWorkflow(
  "merchant-reject-quote-workflow",
  (input: WorkflowInput) => {
    // @ts-ignore
    const { data: quotes } = useQueryGraphStep({
      entity: "quote",
      fields: ["id", "status"],
      filters: { id: input.quote_id },
      options: {
        throwIfKeyNotFound: true,
      }
    });

    validateQuoteRejectionStep({ 
      quote: quotes[0]
    });

    updateQuotesWorkflow.runAsStep({
      input: [
        {
          id: input.quote_id,
          status: QuoteStatus.MERCHANT_REJECTED,
        },
      ],
    });
  }
);
