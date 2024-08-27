import RestaurantModuleService from "../service";

export interface CreateRestaurant {
  name: string;
  handle: string;
  address: string;
  phone: string;
  email: string;
  image_url?: string;
  is_open?: boolean;
}

declare module "@medusajs/types" {
  export interface ModuleImplementations {
    restaurantModuleService: RestaurantModuleService;
  }
}