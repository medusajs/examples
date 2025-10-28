import RentalModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const RENTAL_MODULE = "rental"

export default Module(RENTAL_MODULE, {
  service: RentalModuleService,
})