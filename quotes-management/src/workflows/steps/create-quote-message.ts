import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { QUOTE_MODULE } from "../../modules/quote";
import QueryModuleService from "../../modules/quote/service";

type StepInput = {
  text: string;
  quote_id: string;
  admin_id?: string;
  customer_id?: string;
  item_id?: string | null;
}

export const createQuoteMessageStep = createStep(
  "create-quote-message",
  async (
    input: StepInput,
    { container }
  ) => {
    const quoteModuleService: QueryModuleService = container.resolve(QUOTE_MODULE);

    const quoteMessage = await quoteModuleService.createMessages(input);

    return new StepResponse(quoteMessage, quoteMessage.id);
  },
  async (id: string, { container }) => {
    const quoteModuleService: QueryModuleService = container.resolve(QUOTE_MODULE);

    await quoteModuleService.deleteMessages([id]);
  }
);
