import RestaurantModule from "../modules/restaurant";
import DeliveryModule from "../modules/delivery";
import { defineLink } from "@medusajs/framework/utils";

export default defineLink(
  RestaurantModule.linkable.restaurant, 
  {
    linkable: DeliveryModule.linkable.delivery,
    isList: true,
  }
);
