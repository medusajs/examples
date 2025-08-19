import { Module } from "@medusajs/framework/utils";
import PayloadModuleService from "./service";

export const PAYLOAD_MODULE = "payload";

export default Module(PAYLOAD_MODULE, {
  service: PayloadModuleService,
});
