import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { PayloadItemResult, PayloadUpsertData } from "../../modules/payload/types";
import { PAYLOAD_MODULE } from "../../modules/payload";

type StepInput = {
  collection: string;
  items: PayloadUpsertData[];
}

export const updatePayloadItemsStep = createStep(
  "update-payload-items",
  async ({ items, collection }: StepInput, { container }) => {
    const payloadModuleService = container.resolve(PAYLOAD_MODULE)
    const ids: string[] = items.map(item => item.id);

    const prevData = await payloadModuleService.find(collection, {
      where: {
        id: {
          in: ids.join(",")
        }
      }
    })

    const updatedItems: PayloadItemResult[] = []

    for (const item of items) {
      const { id, ...data } = item;
      updatedItems.push(
        await payloadModuleService.update(
          collection,
          data,
          {
            where: {
              id: {
                equals: id
              }
            }
          }
        )
      )
    }

    return new StepResponse({
      items: updatedItems.map(item => item.doc)
    }, {
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

    await Promise.all(
      prevData.docs.map(async ({
        id,
        ...item
      }) => {
        await payloadModuleService.update(
          collection,
          item,
          {
            where: {
              id: {
                equals: id
              }
            }
          }
        )
      })
    )
  }
)