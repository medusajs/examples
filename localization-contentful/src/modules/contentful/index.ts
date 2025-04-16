import { Module } from "@medusajs/framework/utils"
import ContentfulModuleService from "./service"
import createContentModelsLoader from "./loader/create-content-models"

export const CONTENTFUL_MODULE = "contentful"

export default Module(CONTENTFUL_MODULE, {
  service: ContentfulModuleService,
  loaders: [
    createContentModelsLoader,
  ],
})
