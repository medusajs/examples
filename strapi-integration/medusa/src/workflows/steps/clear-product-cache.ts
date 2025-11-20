import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

type ClearProductCacheInput = {
  productId: string | string[]
}

export const clearProductCacheStep = createStep(
  "clear-product-cache",
  async ({ productId }: ClearProductCacheInput, { container }) => {
    const cachingModuleService = container.resolve(Modules.CACHING)

    const productIds = Array.isArray(productId) ? productId : [productId]

    // Clear cache for all specified products
    for (const id of productIds) {
      if (id) {
        await cachingModuleService.clear({
          tags: [`Product:${id}`],
        })
      }
    }

    return new StepResponse({})
  }
)

