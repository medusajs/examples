import { createWorkflow, WorkflowResponse, transform, when } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { updateItemStep } from "./steps/update-item"
import { createVariantItemWorkflow } from "./create-variant-item"

type WorkflowInput = {
  variant_id: string
}

export const updateVariantItemWorkflow = createWorkflow(
  "update-variant-item",
  (input: WorkflowInput) => {
    const { data: variants } = useQueryGraphStep({
      entity: "product_variant",
      fields: [
        "id",
        "sku",
        "title",
        "upc",
        "metadata"
      ],
      filters: {
        id: input.variant_id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    const createResponse = when({ variants }, ({ variants }) => 
      variants.length > 0 && !variants[0].metadata?.avalara_item_id
    )
      .then(() => {
        return createVariantItemWorkflow.runAsStep({
          input: {
            variant_id: input.variant_id
          }
        })
      })

    const updateResponse = when({ variants }, ({ variants }) => 
      variants.length > 0 && !!variants[0].metadata?.avalara_item_id
    )
      .then(() => {
        const item = transform({ variants }, ({ variants }) => {
          const variant = variants[0]
    
          return {
            id: variant.metadata?.avalara_item_id as number,
            sku: variant.sku ?? "",
            title: variant.title!,
            upc: variant.upc ?? undefined
          }
        })
        return updateItemStep({ item })
      })

    const response = transform({
      createResponse,
      updateResponse
    }, (data) => {
      return data.createResponse || data.updateResponse
    })

    return new WorkflowResponse(response)
  }
)

