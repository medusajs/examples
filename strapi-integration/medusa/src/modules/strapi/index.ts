import { Module } from "@medusajs/framework/utils"
import StrapiModuleService from "./service"
import initStrapiClientLoader from "./loaders/init-client"

export const STRAPI_MODULE = "strapi"

export default Module(STRAPI_MODULE, {
  service: StrapiModuleService,
  loaders: [initStrapiClientLoader],
})

