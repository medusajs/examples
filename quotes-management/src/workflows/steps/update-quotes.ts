import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk";
import { QUOTE_MODULE } from "../../modules/quote";
import { QuoteStatus } from "../../modules/quote/models/quote";
import QuoteModuleService from "../../modules/quote/service";

type StepInput = {
  id: string;
  status?: QuoteStatus;
}[]

export const updateQuotesStep = createStep(
  "update-quotes",
  async (data: StepInput, { container }) => {
    const quoteModuleService: QuoteModuleService = container.resolve(QUOTE_MODULE);

    const dataBeforeUpdate = await quoteModuleService.listQuotes(
      { id: data.map((d) => d.id) },
    );

    const updatedQuotes = await quoteModuleService.updateQuotes(data);

    return new StepResponse(updatedQuotes, {
      dataBeforeUpdate,
    });
  },
  async (revertInput, { container }) => {
    if (!revertInput) {
      return;
    }

    const quoteModuleService: QuoteModuleService = container.resolve(QUOTE_MODULE);

    await quoteModuleService.updateQuotes(
      revertInput.dataBeforeUpdate
    );
  }
);
