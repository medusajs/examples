import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_BUILDER_MODULE } from "../../modules/product-builder"

export type CreateProductBuilderStepInput = {
  product_id: string
}

export const createProductBuilderStep = createStep(
  "create-product-builder",
  async (input: CreateProductBuilderStepInput, { container }) => {
    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)

    const productBuilder = await productBuilderModuleService.createProductBuilders({
      product_id: input.product_id
    })

    return new StepResponse(productBuilder, productBuilder)
  },
  async (productBuilder, { container }) => {
    if (!productBuilder) return

    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)
    
    await productBuilderModuleService.deleteProductBuilders(productBuilder.id)
  }
)
