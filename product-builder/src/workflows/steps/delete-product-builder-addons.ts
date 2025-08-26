import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_BUILDER_MODULE } from "../../modules/product-builder"

export type DeleteProductBuilderAddonsStepInput = {
  addon_products: Array<{
    id: string
    product_builder_id: string
    product_id: string
  }>
}

export const deleteProductBuilderAddonsStep = createStep(
  "delete-product-builder-addons",
  async (input: DeleteProductBuilderAddonsStepInput, { container }) => {
    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)
    
    await productBuilderModuleService.deleteProductBuilderAddons(
      input.addon_products.map(a => a.id)
    )
    
    return new StepResponse(input.addon_products, {
      deletedItems: input.addon_products
    })
  },
  async (compensationData, { container }) => {
    if (!compensationData?.deletedItems?.length) {
      return
    }

    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)
    await productBuilderModuleService.createProductBuilderAddons(
      compensationData.deletedItems.map((a: any) => ({
        id: a.id,
        product_builder_id: a.product_builder_id,
        product_id: a.product_id,
      }))
    )
  }
)
