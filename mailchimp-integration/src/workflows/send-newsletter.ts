import { createWorkflow, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { sendNotificationsStep, useQueryGraphStep } from "@medusajs/medusa/core-flows";

export const sendNewProductsNewsletter = createWorkflow(
  "send-new-products-newsletter", 
  (input) => {
    // @ts-ignore
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: [
        "title",
        "handle",
        "thumbnail",
        "description"
      ],
      filters: {
        created_at: {
          // Get products created in the last 7 days
          // 7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    when({ products }, ({ products }) => products.length > 0)
      .then(() => {
        sendNotificationsStep([
          {
            to: "audience", // will be filled in by provider
            channel: "email",
            template: "new-products",
            data: {
              products
            }
          }
        ])
      })

    return new WorkflowResponse(void 0)
  }
)