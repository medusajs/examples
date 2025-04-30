import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { CONTENTFUL_MODULE } from "../../../modules/contentful"
import ContentfulModuleService from "../../../modules/contentful/service"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const contentfulModuleService: ContentfulModuleService = req.scope.resolve(
    CONTENTFUL_MODULE
  )

  const locales = await contentfulModuleService.getLocales()
  const defaultLocaleCode = await contentfulModuleService.getDefaultLocaleCode()

  const formattedLocales = locales.items.map((locale) => {
    return {
      name: locale.name,
      code: locale.code,
      is_default: locale.code === defaultLocaleCode,
    }
  })

  res.json({
    locales: formattedLocales,
  })
}
