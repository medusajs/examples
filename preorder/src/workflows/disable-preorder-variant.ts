import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { disablePreorderVariantStep } from "./steps/disable-preorder-variant"

type WorkflowInput = {
  variant_id: string
}

export const disablePreorderVariantWorkflow = createWorkflow(
  "disable-preorder-variant",
  (input: WorkflowInput) => {
    const { data: preorderVariants } = useQueryGraphStep({
      entity: "preorder_variant",
      fields: ["*"],
      filters: {
        variant_id: input.variant_id,
      },
    })

    const preorderVariant = disablePreorderVariantStep({
      id: preorderVariants[0].id,
    })

    return new WorkflowResponse(preorderVariant)
  }
)