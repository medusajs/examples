import { Module } from "@medusajs/framework/utils"
import LoyaltyModuleService from "./service"

export const LOYALTY_MODULE = "loyalty"

export default Module(LOYALTY_MODULE, {
  service: LoyaltyModuleService,
})
