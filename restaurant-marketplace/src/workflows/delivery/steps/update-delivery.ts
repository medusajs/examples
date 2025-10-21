import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { DELIVERY_MODULE } from "../../../modules/delivery";
import { UpdateDelivery } from "../../../modules/delivery/types";
import DeliveryModuleService from "../../../modules/delivery/service";

type UpdateDeliveryStepInput = {
  data: UpdateDelivery;
};

export const updateDeliveryStep = createStep(
  "update-delivery-step",
  async function ({ data }: UpdateDeliveryStepInput, { container }) {
    const deliveryModuleService: DeliveryModuleService = 
      container.resolve(DELIVERY_MODULE);

    const prevDeliveryData = await deliveryModuleService.retrieveDelivery(data.id)

    const delivery = await deliveryModuleService
      .updateDeliveries([data])
      .then((res) => res[0]);

    return new StepResponse(delivery, {
      prevDeliveryData
    });
  },
  async (data, { container }) => {
    if (!data) {
      return
    }
    const deliverModuleService: DeliveryModuleService = 
      container.resolve(DELIVERY_MODULE);

    const { 
      driver, 
      ...prevDeliveryDataWithoutDriver
    } = data.prevDeliveryData;

    await deliverModuleService.updateDeliveries(prevDeliveryDataWithoutDriver)
  }
);
