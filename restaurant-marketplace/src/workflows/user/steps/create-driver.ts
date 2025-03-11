import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { DELIVERY_MODULE } from "../../../modules/delivery";
import DeliveryModuleService from "../../../modules/delivery/service";

export type CreateDriverInput = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url?: string;
};

export const createDriverStep = createStep(
  "create-driver-step",
  async (
    data: CreateDriverInput,
    { container }
  ) => {
    const deliveryModuleService: DeliveryModuleService = container.resolve(DELIVERY_MODULE)
    
    const driver = await deliveryModuleService.createDrivers(data);

    return new StepResponse(driver, driver.id);
  },
  async (id, { container }) => {
    if (!id) {
      return
    }

    const deliveryModuleService: DeliveryModuleService = container.resolve(
      DELIVERY_MODULE
    );

    await deliveryModuleService.deleteDrivers(id);
  }
);
