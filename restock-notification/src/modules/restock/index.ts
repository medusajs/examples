import { Module } from "@medusajs/framework/utils"
import RestockModuleService from "./service"

export const RESTOCK_MODULE = "restock"

export default Module(RESTOCK_MODULE, {
  service: RestockModuleService
})