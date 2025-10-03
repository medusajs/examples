import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { getProductFeedItemsStep } from "./steps/get-product-feed-items"
import { buildProductFeedXmlStep } from "./steps/build-product-feed-xml"
import { sendProductFeedStep } from "./steps/send-product-feed"

type GenerateProductFeedWorkflowInput = {
  currency_code: string
  country_code: string
}

export const sendProductFeedWorkflow = createWorkflow(
  "send-product-feed",
  (input: GenerateProductFeedWorkflowInput) => {
    const { items: feedItems } = getProductFeedItemsStep(input)

    const xml = buildProductFeedXmlStep({ 
      items: feedItems
    })

    sendProductFeedStep({
      productFeed: xml
    })

    return new WorkflowResponse({ xml })
  }
)

export default sendProductFeedWorkflow
