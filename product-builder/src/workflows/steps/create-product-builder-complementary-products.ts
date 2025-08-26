import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_BUILDER_MODULE } from "../../modules/product-builder"

export type CreateProductBuilderComplementaryProductsStepInput = {
  complementary_products: Array<{
    product_builder_id: string
    product_id: string
  }>
}

export const createProductBuilderComplementaryProductsStep = createStep(
  "create-product-builder-complementary-products",
  async (input: CreateProductBuilderComplementaryProductsStepInput, { container }) => {
    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)
    
    const created = await productBuilderModuleService.createProductBuilderComplementaries(
      input.complementary_products
    )
    const createdArray = Array.isArray(created) ? created : [created]
    
    return new StepResponse(createdArray, {
      createdIds: createdArray.map((p: any) => p.id)
    })
  },
  async (compensationData, { container }) => {
    if (!compensationData?.createdIds?.length) {
      return
    }

    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)
    await productBuilderModuleService.deleteProductBuilderComplementaries(
      compensationData.createdIds
    )
  }
)
