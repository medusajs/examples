import { InferTypeOf } from "@medusajs/types";
import RestaurantModuleService from "../service";
import { Restaurant } from "../models/restaurant";

export type CreateRestaurant = Omit<
  InferTypeOf<typeof Restaurant>, "id" | "admins"
>

declare module "@medusajs/types" {
  export interface ModuleImplementations {
    restaurantModuleService: RestaurantModuleService;
  }
}