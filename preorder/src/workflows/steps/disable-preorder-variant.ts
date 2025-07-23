import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PreorderVariantStatus } from "../../modules/preorder/models/preorder-variant"

type StepInput = {
  id: string
}

export const disablePreorderVariantStep = createStep(
  "disable-preorder-variant",
  async ({ id }: StepInput, { container }) => {
    const preorderModuleService = container.resolve("preorder")

    const oldData = await preorderModuleService.retrievePreorderVariant(id)
    
    const preorderVariant = await preorderModuleService.updatePreorderVariants({
      id,
      status: PreorderVariantStatus.DISABLED,
    })

    return new StepResponse(preorderVariant, oldData)
  },
  async (preorderVariant, { container }) => {
    if (!preorderVariant) {
      return
    }

    const preorderModuleService = container.resolve("preorder")

    await preorderModuleService.updatePreorderVariants({
      id: preorderVariant.id,
      status: preorderVariant.status,
    })
  }
)