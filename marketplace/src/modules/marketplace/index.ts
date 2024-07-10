import { Module } from "@medusajs/utils"
import MarketplaceModuleService from "./service"

export const MARKETPLACE_MODULE = "marketplaceModuleService"

export default Module(MARKETPLACE_MODULE, {
  service: MarketplaceModuleService
})