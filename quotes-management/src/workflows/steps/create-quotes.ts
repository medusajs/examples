import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { QUOTE_MODULE } from "../../modules/quote";
import QueryModuleService from "../../modules/quote/service";

type StepInput = {
  draft_order_id: string;
  order_change_id: string;
  cart_id: string;
  customer_id: string;
}[]

export const createQuotesStep = createStep(
  "create-quotes",
  async (input: StepInput, { container }) => {
    const quoteModuleService: QueryModuleService = container.resolve(
      QUOTE_MODULE
    );

    const quotes = await quoteModuleService.createQuotes(input);

    return new StepResponse(
      quotes,
      quotes.map((quote) => quote.id)
    );
  },
  async (quoteIds, { container }) => {
    if (!quoteIds) {
      return
    }
    
    const quoteModuleService: QueryModuleService = container.resolve(
      QUOTE_MODULE
    );

    await quoteModuleService.deleteQuotes(quoteIds);
  }
);
