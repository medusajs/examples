import { Module } from "@medusajs/utils"
import SubscriptionModuleService from "./service"

export const SUBSCRIPTION_MODULE = "subscriptionModuleService"

export default Module(SUBSCRIPTION_MODULE, {
  service: SubscriptionModuleService
})