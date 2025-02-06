import { Module } from "@medusajs/framework/utils";
import MetalPricesModuleService from "./service";

export const METAL_PRICES_MODULE = "metal-prices"

export default Module(METAL_PRICES_MODULE, {
  service: MetalPricesModuleService
})