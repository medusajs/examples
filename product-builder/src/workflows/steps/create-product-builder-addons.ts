import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_BUILDER_MODULE } from "../../modules/product-builder"

export type CreateProductBuilderAddonsStepInput = {
  addon_products: Array<{
    product_builder_id: string
    addon_product_id: string
  }>
}

export const createProductBuilderAddonsStep = createStep(
  "create-product-builder-addons",
  async (input: CreateProductBuilderAddonsStepInput, { container }) => {
    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)
    
    const createdAddons = await productBuilderModuleService.createProductBuilderAddons(
      input.addon_products
    )
    
    return new StepResponse(createdAddons, {
      createdItems: createdAddons
    })
  },
  async (compensationData, { container }) => {
    if (!compensationData?.createdItems?.length) {
      return
    }

    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)
    await productBuilderModuleService.deleteProductBuilderAddons(
      compensationData.createdItems.map((a: any) => a.id)
    )
  }
)
