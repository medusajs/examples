import DeliveryModule from "../modules/delivery";
import CartModule from "@medusajs/cart";
import { defineLink } from "@medusajs/framework/utils";

export default defineLink(
  DeliveryModule.linkable.delivery,
  CartModule.linkable.cart
);
