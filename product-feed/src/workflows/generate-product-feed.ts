import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { getProductFeedItemsStep } from "./steps/get-product-feed-items"
import { buildProductFieldXmlStep } from "./steps/build-product-field-xml"

type GenerateProductFeedWorkflowInput = {
  currency_code: string
  country_code: string
}

export const generateProductFeedWorkflow = createWorkflow(
  "generate-product-feed",
  (input: GenerateProductFeedWorkflowInput) => {
    const { items: feedItems } = getProductFeedItemsStep(input)

    const xml = buildProductFieldXmlStep({ 
      items: feedItems
    })

    return new WorkflowResponse({ xml })
  }
)

export default generateProductFeedWorkflow
