import {
  convertItemResponseToUpdateRequest,
  getSelectsAndRelationsFromObjectArray,
} from "@medusajs/framework/utils";
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
    const { selects, relations } = getSelectsAndRelationsFromObjectArray(data);

    const dataBeforeUpdate = await quoteModuleService.listQuotes(
      { id: data.map((d) => d.id) },
      { relations, select: selects }
    );

    const updatedQuotes = await quoteModuleService.updateQuotes(data);

    return new StepResponse(updatedQuotes, {
      dataBeforeUpdate,
      selects,
      relations,
    });
  },
  async (revertInput, { container }) => {
    if (!revertInput) {
      return;
    }

    const quoteModuleService: QuoteModuleService = container.resolve(QUOTE_MODULE);
    const { dataBeforeUpdate, selects, relations } = revertInput;

    await quoteModuleService.updateQuotes(
      dataBeforeUpdate.map((data) =>
        convertItemResponseToUpdateRequest(data, selects, relations)
      )
    );
  }
);
