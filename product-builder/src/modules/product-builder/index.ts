import Service from "./service"
import { Module } from "@medusajs/framework/utils"

export const PRODUCT_BUILDER_MODULE = "productBuilder"

export default Module(PRODUCT_BUILDER_MODULE, {
  service: Service,
})
