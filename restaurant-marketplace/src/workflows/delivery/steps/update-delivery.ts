import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { DELIVERY_MODULE } from "../../../modules/delivery";
import { UpdateDelivery } from "../../../modules/delivery/types";

type UpdateDeliveryStepInput = {
  data: UpdateDelivery;
};

export const updateDeliveryStep = createStep(
  "update-delivery-step",
  async function ({ data }: UpdateDeliveryStepInput, { container }) {
    const deliveryService = container.resolve(DELIVERY_MODULE);

    const prevDeliveryData = await deliveryService.retrieveDelivery(data.id)

    const delivery = await deliveryService
      .updateDeliveries([data])
      .then((res) => res[0]);

    return new StepResponse(delivery, {
      prevDeliveryData
    });
  },
  async ({ prevDeliveryData }, { container }) => {
    const deliveryService = container.resolve(DELIVERY_MODULE);

    await deliveryService.updateDeliveries(prevDeliveryData)
  }
);
