import { MedusaService } from "@medusajs/framework/utils";
import { Restaurant } from "./models/restaurant";
import { RestaurantAdmin } from "./models/restaurant-admin";

class RestaurantModuleService extends MedusaService({
  Restaurant,
  RestaurantAdmin,
}) {}

export default RestaurantModuleService;
