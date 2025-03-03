import { MedusaError } from "@medusajs/framework/utils";
import { createStep } from "@medusajs/framework/workflows-sdk";
import { InferTypeOf } from "@medusajs/framework/types";
import { Quote } from "../../modules/quote/models/quote";

type StepInput = {
  quote: InferTypeOf<typeof Quote>
}

export const validateQuoteRejectionStep = createStep(
  "validate-quote-rejection-step",
  async function ({ quote }: StepInput) {
    if (["accepted"].includes(quote.status)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Quote is already accepted by customer`
      );
    }
  }
);
