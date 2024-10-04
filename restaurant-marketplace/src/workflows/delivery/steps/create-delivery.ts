import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk";
import { DELIVERY_MODULE } from "../../../modules/delivery";

export const createDeliveryStep = createStep(
  "create-delivery-step",
  async function (_, { container }) {
    const service = container.resolve(DELIVERY_MODULE);

    const delivery = await service.createDeliveries({})

    return new StepResponse(delivery, {
      delivery_id: delivery.id,
    });
  },
  async function ({ delivery_id }, { container }) {
    const service = container.resolve(DELIVERY_MODULE);

    service.softDeleteDeliveries(delivery_id);
  }
);
