import { MedusaError } from "@medusajs/utils";
import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { RESTAURANT_MODULE } from "../../../modules/restaurant";
import { DELIVERY_MODULE } from "../../../modules/delivery";

export type CreateRestaurantAdminInput = {
  restaurant_id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export type CreateDriverInput = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url?: string;
};

type CreateUserStepInput = (CreateRestaurantAdminInput | CreateDriverInput) & {
  actor_type: "restaurant" | "driver";
};

export const createUserStep = createStep(
  "create-user-step",
  async (
    { actor_type, ...data }: CreateUserStepInput,
    { container }
  ) => {
    if (actor_type === "restaurant") {
      const service = container.resolve(RESTAURANT_MODULE);

      const restaurantAdmin = await service.createRestaurantAdmins(
        data
      );

      return new StepResponse(restaurantAdmin, {
        id: restaurantAdmin.id,
        actor_type: actor_type as string,
      });
    } else if (actor_type === "driver") {
      const service = container.resolve(DELIVERY_MODULE);

      const driver = await service.createDrivers(data);

      return new StepResponse(driver, {
        id: driver.id,
        actor_type: actor_type as string,
      });
    }

    throw MedusaError.Types.INVALID_DATA;
  },
  function ({ id, actor_type }, { container }) {
    if (actor_type === "restaurant") {
      const service = container.resolve(RESTAURANT_MODULE);

      return service.deleteRestaurantAdmins(id);
    } else {
      const service = container.resolve(DELIVERY_MODULE);

      return service.deleteDrivers(id);
    }
  }
);
