import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import ContentfulModuleService from "../../modules/contentful/service"
import { CONTENTFUL_MODULE } from "../../modules/contentful"

type StepInput = {
  option_ids: string[]
}

export const getOptionsContentfulStep = createStep(
  "get-options-contentful-step",
  async (input: StepInput, { container }) => {
    const contentfulModuleService: ContentfulModuleService = 
      container.resolve(CONTENTFUL_MODULE)

    const options = await contentfulModuleService.getOptions(input.option_ids)
    
    return new StepResponse(options)
  }
)
