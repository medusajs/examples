import AgenticCommerceService from "./service"
import { Module } from "@medusajs/framework/utils"

export const AGENTIC_COMMERCE_MODULE = "agenticCommerce"

export default Module(AGENTIC_COMMERCE_MODULE, {
  service: AgenticCommerceService,
})