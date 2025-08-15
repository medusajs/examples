import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { PAYLOAD_MODULE } from "../../modules/payload";

type StepInput = {
  collection: string;
  where: Record<string, any>;
}

export const retrievePayloadItemsStep = createStep(
  "retrieve-payload-items",
  async ({ where, collection }: StepInput, { container }) => {
    const payloadModuleService = container.resolve(PAYLOAD_MODULE);

    const items = await payloadModuleService.find(collection, {
      where
    });

    return new StepResponse({
      items: items.docs
    });
  },
)