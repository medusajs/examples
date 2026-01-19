import { ProductOptionDTO } from "@medusajs/framework/types"
import { CONTENTFUL_MODULE } from "../../modules/contentful"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import ContentfulModuleService from "../../modules/contentful/service"
import { EntryProps } from "contentful-management"

type StepInput = {
  options: ProductOptionDTO[]
}

export const createProductOptionsContentfulStep = createStep(
  "create-product-options-contentful-step",
  async (input: StepInput, { container }) => {
    const contentfulModuleService: ContentfulModuleService = 
      container.resolve(CONTENTFUL_MODULE)

    const options: EntryProps[] = []

    try {
      for (const option of input.options) {
        options.push(await contentfulModuleService.createOrUpdateProductOption(option))
      }
    } catch(e) {
      return StepResponse.permanentFailure(
        `Error creating product options in Contentful: ${e.message}`,
        options
      )
    }

    return new StepResponse(
      options,
      options
    )
  },
  async (options, { container }) => {
    if (!options) {
      return
    }

    const contentfulModuleService: ContentfulModuleService = 
      container.resolve(CONTENTFUL_MODULE)

    // Delete options that were created during this step
    for (const option of options) {
      try {
        await contentfulModuleService.deleteProductOption(option.sys.id)
      } catch (error) {
        // Option might not exist or already deleted, continue
      }
    }
  }
)

