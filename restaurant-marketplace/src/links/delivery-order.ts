import DeliveryModule from "../modules/delivery";
import OrderModule from "@medusajs/order";
import { defineLink } from "@medusajs/utils";

export default defineLink(
  DeliveryModule.linkable.delivery,
  OrderModule.linkable.order
);
