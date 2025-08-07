import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { PAYLOAD_MODULE } from "../../modules/payload";

type StepInput = {
  collection: string;
  where: Record<string, any>;
}

export const deletePayloadItemsStep = createStep(
  "delete-payload-items",
  async ({ where, collection }: StepInput, { container }) => {
    const payloadModuleService = container.resolve(PAYLOAD_MODULE)

    const prevData = await payloadModuleService.find(collection, {
      where
    })

    await payloadModuleService.delete(collection, {
      where
    });

    return new StepResponse({}, {
      prevData,
      collection,
    })
  },
  async (data, { container }) => {
    if (!data) {
      return;
    }
    const { prevData, collection } = data;

    const payloadModuleService = container.resolve(PAYLOAD_MODULE);

    for (const item of prevData.docs) {
      await payloadModuleService.create(
        collection,
        item
      );
    }
  }
)