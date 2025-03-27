import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk";
import { RESTAURANT_MODULE } from "../../../modules/restaurant";
import { CreateRestaurant } from "../../../modules/restaurant/types";
import RestaurantModuleService from "../../../modules/restaurant/service";

export const createRestaurantStep = createStep(
  "create-restaurant-step",
  async function (data: CreateRestaurant, { container }) {
    const restaurantModuleService: RestaurantModuleService = container.resolve(
      RESTAURANT_MODULE
    );

    const restaurant = await restaurantModuleService.createRestaurants(data);

    return new StepResponse(restaurant, restaurant.id);
  },
  function (id: string, { container }) {
    const restaurantModuleService: RestaurantModuleService = container.resolve(
      RESTAURANT_MODULE
    );

    return restaurantModuleService.deleteRestaurants(id);
  }
);
