import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { RESTAURANT_MODULE } from "../../../modules/restaurant";

export type CreateRestaurantAdminInput = {
  restaurant_id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export const createRestaurantAdminStep = createStep(
  "create-restaurant-admin-step",
  async (
    data: CreateRestaurantAdminInput,
    { container }
  ) => {
    const restaurantModuleService = container.resolve(RESTAURANT_MODULE)
    const restaurantAdmin = await restaurantModuleService.createRestaurantAdmins(
      data
    );

    return new StepResponse(restaurantAdmin, restaurantAdmin.id)
  },
  async (id, { container }) => {
    if (!id) {
      return
    }

    const service = container.resolve(RESTAURANT_MODULE);

      await service.deleteRestaurantAdmins(id);
  }
);
