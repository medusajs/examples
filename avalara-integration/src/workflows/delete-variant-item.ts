import { createWorkflow, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deleteItemStep } from "./steps/delete-item"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

type WorkflowInput = {
  variant_id: string
}

export const deleteVariantItemWorkflow = createWorkflow(
  "delete-item",
  (input: WorkflowInput) => {
    const { data: variants } = useQueryGraphStep({
      entity: "product_variant",
      fields: [
        "id",
        "metadata"
      ],
      filters: {
        id: input.variant_id
      },
      withDeleted: true,
      options: {
        throwIfKeyNotFound: true
      }
    })
    
    when({ variants }, ({ variants }) => 
      variants.length > 0 && !!variants[0].metadata?.avalara_item_id
    )
    .then(() => {
      deleteItemStep({ item_id: variants[0].metadata!.avalara_item_id as number })
    })

    return new WorkflowResponse(void 0)
  }
)

