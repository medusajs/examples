import TierModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const TIER_MODULE = "tier"

export default Module(TIER_MODULE, {
  service: TierModuleService,
})

