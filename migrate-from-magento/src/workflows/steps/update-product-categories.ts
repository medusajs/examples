import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { UpsertProductCategoryDTO } from "@medusajs/framework/types";

type Input = {
  product_categories: UpsertProductCategoryDTO[]
}

export const updateProductCategoriesStep = createStep(
  "update-product-categories",
  async ({ product_categories }: Input, { container }) => {
    const productModuleService = container.resolve("product")
    const previousData = await productModuleService.listProductCategories({
      id: product_categories.map((pc) => pc.id).filter(Boolean) as string[]
    })
    const updatedCategories = await productModuleService.upsertProductCategories(product_categories)

    return new StepResponse(updatedCategories, previousData)
  },
  async (previousData, { container }) => {
    if (!previousData) {
      return
    }
    const productModuleService = container.resolve("product")
    await productModuleService.upsertProductCategories(previousData)
  }
)