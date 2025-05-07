import { Module } from "@medusajs/framework/utils"
import BundledProductsModuleService from "./service"

export const BUNDLED_PRODUCT_MODULE = "bundledProduct"

export default Module(BUNDLED_PRODUCT_MODULE, {
  service: BundledProductsModuleService,
})
