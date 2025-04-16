import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { EntryProps } from "contentful-management";
import ContentfulModuleService from "../../modules/contentful/service";
import { CONTENTFUL_MODULE } from "../../modules/contentful";

type StepInput = {
  entry: EntryProps
}

export const prepareUpdateDataStep = createStep(
  "prepare-update-data",
  async ({ entry }: StepInput, { container }) => {
    const contentfulModuleService: ContentfulModuleService = 
      container.resolve(CONTENTFUL_MODULE)
    
    const defaultLocale = await contentfulModuleService.getDefaultLocaleCode()

    let data: Record<string, unknown> = {}

    switch (entry.sys.contentType.sys.id) {
      case "product":
        data = {
          id: entry.fields.medusaId[defaultLocale!],
          title: entry.fields.title[defaultLocale!],
          subtitle: entry.fields.subtitle?.[defaultLocale!] || undefined,
          handle: entry.fields.handle[defaultLocale!],
        }
        break
      case "productVariant":
        data = {
          id: entry.fields.medusaId[defaultLocale!],
          title: entry.fields.title[defaultLocale!],
        }
        break
      case "productOption":
        data = {
          selector: {
            id: entry.fields.medusaId[defaultLocale!],
          },
          update: {
            title: entry.fields.title[defaultLocale!],
          },
        }
        break
    }

    return new StepResponse(data)
  }
)