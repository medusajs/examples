import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_BUILDER_MODULE } from "../../modules/product-builder"

export type PrepareProductBuilderAddonsStepInput = {
  product_builder_id: string
  addon_products?: Array<{
    id?: string
    product_id: string
  }>
}

export const prepareProductBuilderAddonsStep = createStep(
  "prepare-product-builder-addons",
  async (input: PrepareProductBuilderAddonsStepInput, { container }) => {
    const productBuilderModuleService = container.resolve(PRODUCT_BUILDER_MODULE)

    // Get existing addon associations for this product builder
    const existingAddons = await productBuilderModuleService.listProductBuilderAddons({
      product_builder_id: input.product_builder_id
    })

    // Separate operations: create, update, and delete
    const toCreate: any[] = []

    // Process input products to determine creates
    input.addon_products?.forEach(productData => {
      const existingAddon = existingAddons.find(
        a => a.product_id === productData.product_id
      )
      if (!existingAddon) {
        // Create new addon product
        toCreate.push({
          product_builder_id: input.product_builder_id,
          product_id: productData.product_id,
        })
      }
    })

    // Find products to delete (existing but not in input)
    const toDelete = existingAddons.filter(
      product => !input.addon_products?.some(
        p => p.product_id === product.product_id
      )
    )

    return new StepResponse({
      toCreate,
      toDelete
    })
  }
)
