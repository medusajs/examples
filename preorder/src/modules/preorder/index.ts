import PreorderModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const PREORDER_MODULE = "preorder"

export default Module(PREORDER_MODULE, {
  service: PreorderModuleService,
})