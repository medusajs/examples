import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { createRestaurantStep } from "../steps/create-restaurant";
import { CreateRestaurant } from "../../../modules/restaurant/types";

type WorkflowInput = {
  restaurant: CreateRestaurant;
};

export const createRestaurantWorkflow = createWorkflow(
  "create-restaurant-workflow",
  function (input: WorkflowInput) {
    const restaurant = createRestaurantStep(input.restaurant);

    return new WorkflowResponse(restaurant);
  }
);
