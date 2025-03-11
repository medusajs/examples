import { MedusaError } from "@medusajs/framework/utils";
import { createStep } from "@medusajs/framework/workflows-sdk";
import { InferTypeOf } from "@medusajs/framework/types";
import { Quote, QuoteStatus } from "../../modules/quote/models/quote";

type StepInput = {
  quote: InferTypeOf<typeof Quote>
}

export const validateQuoteNotAccepted = createStep(
  "validate-quote-not-accepted",
  async function ({ quote }: StepInput) {
    if (quote.status === QuoteStatus.ACCEPTED) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Quote is already accepted by customer`
      );
    }
  }
);
