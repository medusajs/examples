import { MedusaError } from "@medusajs/framework/utils";
import { createStep } from "@medusajs/framework/workflows-sdk";
import { InferTypeOf } from "@medusajs/framework/types";
import { Quote } from "../../modules/quote/models/quote";

type StepInput = {
  quote: InferTypeOf<typeof Quote>
}

export const validateQuoteAcceptanceStep = createStep(
  "validate-quote-acceptance-step",
  async function ({ quote }: StepInput) {
    if (!["pending_customer"].includes(quote.status)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot accept quote when quote status is ${quote.status}`
      );
    }
  }
);
