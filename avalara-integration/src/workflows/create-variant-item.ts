import { createWorkflow, WorkflowResponse, transform } from "@medusajs/framework/workflows-sdk"
import { updateProductVariantsWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createItemStep } from "./steps/create-item"

type WorkflowInput = {
  variant_id: string
}

export const createVariantItemWorkflow = createWorkflow(
  "create-variant-item",
  (input: WorkflowInput) => {
    const { data: variants } = useQueryGraphStep({
      entity: "product_variant",
      fields: [
        "id",
        "sku",
        "title",
        "upc"
      ],
      filters: {
        id: input.variant_id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    const stepInput = transform({ variants }, ({ variants }) => {
      const variant = variants[0]

      return {
        item: {
          medusaId: variant.id,
          sku: variant.sku ?? "",
          title: variant.title!,
          upc: variant.upc ?? undefined
        }
      }
    })

    const response = createItemStep(stepInput)

    updateProductVariantsWorkflow.runAsStep({
      input: {
        product_variants: [
          {
            id: input.variant_id,
            metadata: {
              avalara_item_id: response.id
            }
          }
        ]
      }
    })
    
    return new WorkflowResponse(response)
  }
)

