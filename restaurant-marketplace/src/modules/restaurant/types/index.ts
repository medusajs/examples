import { InferTypeOf } from "@medusajs/framework/types";
import RestaurantModuleService from "../service";
import { Restaurant } from "../models/restaurant";

export type CreateRestaurant = Omit<
  InferTypeOf<typeof Restaurant>, "id" | "admins"
>

declare module "@medusajs/framework/types" {
  export interface ModuleImplementations {
    restaurantModuleService: RestaurantModuleService;
  }
}