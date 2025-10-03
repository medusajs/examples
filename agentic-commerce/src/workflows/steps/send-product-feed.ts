import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { AGENTIC_COMMERCE_MODULE } from "../../modules/agentic-commerce"

type StepInput = {
  productFeed: string
}

export const sendProductFeedStep = createStep(
  "send-product-feed",
  async (input: StepInput, { container }) => {
    const agenticCommerceModuleService = container.resolve(AGENTIC_COMMERCE_MODULE)

    await agenticCommerceModuleService.sendProductFeed(input.productFeed)

    return new StepResponse(void 0)
  }
)