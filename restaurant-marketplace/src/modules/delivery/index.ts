import Service from "./service";
import { Module } from "@medusajs/framework/utils";

export const DELIVERY_MODULE = "deliveryModuleService";

export default Module(DELIVERY_MODULE, {
  service: Service,
});
