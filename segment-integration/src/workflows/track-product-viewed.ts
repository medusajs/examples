import { createWorkflow, WorkflowResponse, transform, when } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { trackEventStep } from "./steps/track-event"

type TrackProductViewedInput = {
  product_id: string
  customer_id?: string
}

export const trackProductViewedWorkflow = createWorkflow(
  "track-product-viewed",
  (input: TrackProductViewedInput) => {
    // @ts-ignore
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: ["id", "title", "handle", "thumbnail"],
      filters: {
        id: input.product_id
      }
    })

    // Transform data into tracking payload
    const trackingData = transform(
      {
        product: products[0],
      },
      (data) => ({
        product_id: data.product.id,
        handle: data.product.handle,
        title: data.product.title,
        thumbnail: data.product.thumbnail,
      })
    )

    trackEventStep({
      event: "product.viewed",
      userId: input.customer_id,
      properties: trackingData
    })
  }
)

