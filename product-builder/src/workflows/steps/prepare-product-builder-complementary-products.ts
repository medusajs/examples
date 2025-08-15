import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_BUILDER_MODULE } from "../../modules/product-builder"

export type PrepareProductBuilderComplementaryProductsStepInput = {
  product_builder_id: string
  complementary_products?: Array<{
    id?: string
    product_id: string
  }>
}

export const prepareProductBuilderComplementaryProductsStep = createStep(
  "prepare-product-builder-complementary-products",
  async (input: PrepareProductBuilderComplementaryProductsStepInput, { container }) => {
    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)

    // Get existing complementary products for this product builder
    const existingComplementaryProducts = await productBuilderModuleService
      .listProductBuilderComplementaries({
        product_builder_id: input.product_builder_id
      })

    // Separate operations: create and delete
    const toCreate: any[] = []

    // Process input products to determine creates
    input.complementary_products?.forEach(productData => {
      const existingProduct = existingComplementaryProducts.find(
        p => p.product_id === productData.product_id
      )
      if (!existingProduct) {
        // Create new complementary product
        toCreate.push({
          product_builder_id: input.product_builder_id,
          product_id: productData.product_id,
        })
      }
    })

    // Find products to delete (existing but not in input)
    const toDelete = existingComplementaryProducts.filter(
      product => !input.complementary_products?.some(
        p => p.product_id === product.product_id
      )
    )

    return new StepResponse({
      toCreate,
      toDelete
    })
  }
)
