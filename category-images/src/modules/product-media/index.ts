import ProductMediaModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const PRODUCT_MEDIA_MODULE = "productMedia"

export default Module(PRODUCT_MEDIA_MODULE, {
  service: ProductMediaModuleService,
})

