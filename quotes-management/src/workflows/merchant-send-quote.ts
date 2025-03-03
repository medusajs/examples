import { useQueryGraphStep } from "@medusajs/core-flows";
import { createWorkflow } from "@medusajs/workflows-sdk";
import { updateQuotesWorkflow } from "./update-quote";
import { QuoteStatus } from "../modules/quote/models/quote";

type WorkflowInput = {
  quote_id: string;
}

export const merchantSendQuoteWorkflow = createWorkflow(
  "merchant-send-quote-workflow",
  // @ts-ignore
  (input: WorkflowInput) => {
    // use Query to validate that the query exists
    // otherwise, an error is thrown
    useQueryGraphStep({
      entity: "quote",
      fields: ["id"],
      filters: { id: input.quote_id },
      options: {
        throwIfKeyNotFound: true
      }
    });

    updateQuotesWorkflow.runAsStep({
      input: [
        {
          id: input.quote_id,
          status: QuoteStatus.PENDING_CUSTOMER,
        },
      ],
    });
  }
);
