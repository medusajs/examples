import { MedusaError } from "@medusajs/framework/utils";
import { createStep } from "@medusajs/framework/workflows-sdk";
import { InferTypeOf } from "@medusajs/framework/types";
import { Quote, QuoteStatus } from "../../modules/quote/models/quote";

type StepInput = {
  quote: InferTypeOf<typeof Quote>
}

export const validateQuoteCanAcceptStep = createStep(
  "validate-quote-can-accept",
  async function ({ quote }: StepInput) {
    if (quote.status !== QuoteStatus.PENDING_CUSTOMER) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot accept quote when quote status is ${quote.status}`
      );
    }
  }
);
