import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_BUILDER_MODULE } from "../../modules/product-builder"

export type DeleteProductBuilderComplementaryProductsStepInput = {
  complementary_products: Array<{
    id: string
    product_id: string
    product_builder_id: string
  }>
}

export const deleteProductBuilderComplementaryProductsStep = createStep(
  "delete-product-builder-complementary-products",
  async (input: DeleteProductBuilderComplementaryProductsStepInput, { container }) => {
    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)
    
    await productBuilderModuleService.deleteProductBuilderComplementaries(
      input.complementary_products.map(p => p.id)
    )
    
    return new StepResponse(input.complementary_products, {
      deletedItems: input.complementary_products
    })
  },
  async (compensationData, { container }) => {
    if (!compensationData?.deletedItems?.length) {
      return
    }

    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)
    await productBuilderModuleService.createProductBuilderComplementaries(
      compensationData.deletedItems.map((p: any) => ({
        id: p.id,
        product_builder_id: p.product_builder_id,
        product_id: p.product_id,
      }))
    )
  }
)
