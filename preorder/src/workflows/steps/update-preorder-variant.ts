import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PreorderVariantStatus } from "../../modules/preorder/models/preorder-variant"

type StepInput = {
  id: string
  variant_id?: string
  available_date?: Date
  status?: PreorderVariantStatus
}

export const updatePreorderVariantStep = createStep(
  "update-preorder-variant",
  async (input: StepInput, { container }) => {
    const preorderModuleService = container.resolve(
      "preorder"
    )
    
    const oldData = await preorderModuleService.retrievePreorderVariant(input.id)
    
    const preorderVariant = await preorderModuleService.updatePreorderVariants(input)

    return new StepResponse(preorderVariant, oldData)
  },
  async (preorderVariant, { container }) => {
    if (!preorderVariant) {
      return
    }

    const preorderModuleService = container.resolve(
      "preorder"
    )

    await preorderModuleService.updatePreorderVariants({
      id: preorderVariant.id,
      variant_id: preorderVariant.variant_id,
      available_date: preorderVariant.available_date
    })
  }
)