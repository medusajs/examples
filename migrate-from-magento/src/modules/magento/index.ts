import { Module } from "@medusajs/framework/utils"
import MagentoModuleService from "./service"

export const MAGENTO_MODULE = "magento"

export default Module(MAGENTO_MODULE, {
  service: MagentoModuleService,
})

