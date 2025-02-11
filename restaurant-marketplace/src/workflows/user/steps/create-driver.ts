import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { RESTAURANT_MODULE } from "../../../modules/restaurant";
import { DELIVERY_MODULE } from "../../../modules/delivery";

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
    const deliveryModuleService = container.resolve(DELIVERY_MODULE)
    
    const driver = await deliveryModuleService.createDrivers(data);

    return new StepResponse(driver, driver.id);
  },
  async (id, { container }) => {
    if (!id) {
      return
    }

    const service = container.resolve(RESTAURANT_MODULE);

    await service.deleteRestaurantAdmins(id);
  }
);
