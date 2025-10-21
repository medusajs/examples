import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk";
import { DELIVERY_MODULE } from "../../../modules/delivery";
import DeliveryModuleService from "../../../modules/delivery/service";

export const createDeliveryStep = createStep(
  "create-delivery-step",
  async function (_, { container }) {
    const deliverModuleService: DeliveryModuleService = 
      container.resolve(DELIVERY_MODULE);

    const delivery = await deliverModuleService.createDeliveries({})

    return new StepResponse(delivery, {
      delivery_id: delivery.id,
    });
  },
  async function (data, { container }) {
    if (!data) {
      return
    }
    const deliverModuleService: DeliveryModuleService = 
      container.resolve(DELIVERY_MODULE);

    deliverModuleService.softDeleteDeliveries(data.delivery_id);
  }
);
