import { ProductDTO } from "@medusajs/framework/types"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MEILISEARCH_MODULE } from "../../modules/meilisearch"
import MeilisearchModuleService from "../../modules/meilisearch/service"

export type SyncProductsStepInput = {
  products: ProductDTO[]
}

export const syncProductsStep = createStep(
  "sync-products",
  async ({ products }: SyncProductsStepInput, { container }) => {
     const meilisearchModuleService = container.resolve<MeilisearchModuleService>(
      MEILISEARCH_MODULE
    )
    const existingProducts = await meilisearchModuleService.retrieveFromIndex(
      products.map((product) => product.id),
      "product"
    )
    const newProducts = products.filter((product) => !existingProducts.some(
      (p) => p.id === product.id)
    )
    await meilisearchModuleService.indexData(
      products as unknown as Record<string, unknown>[], 
      "product"
    )

    return new StepResponse(undefined, {
      newProducts: newProducts.map((product) => product.id),
      existingProducts
    })
  },
  async (input, { container }) => {
    if (!input) {
      return
    }

     const meilisearchModuleService = container.resolve<MeilisearchModuleService>(
      MEILISEARCH_MODULE
    )
    
    if (input.newProducts) {
      await meilisearchModuleService.deleteFromIndex(
        input.newProducts,
        "product"
      )
    }

    if (input.existingProducts) {
      await meilisearchModuleService.indexData(
        input.existingProducts,
        "product"
      )
    }
  }
)
