import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BUNDLED_PRODUCT_MODULE } from "../../modules/bundled-product"
import BundledProductModuleService from "../../modules/bundled-product/service"

type CreateBundleItemsStepInput = {
  bundle_id: string
  items: {
    quantity: number
  }[]
}

export const createBundleItemsStep = createStep(
  "create-bundle-items",
  async ({ bundle_id, items }: CreateBundleItemsStepInput, { container }) => {
    const bundledProductModuleService: BundledProductModuleService = container.resolve(
      BUNDLED_PRODUCT_MODULE
    )

    const bundleItems = await bundledProductModuleService.createBundleItems(
      items.map(item => ({
        bundle_id,
        quantity: item.quantity,
      }))
    )

    return new StepResponse(bundleItems, bundleItems.map(item => item.id))
  },
  async (itemIds, { container }) => {
    if (!itemIds?.length) {
      return
    }

    const bundledProductModuleService: BundledProductModuleService = container.resolve(
      BUNDLED_PRODUCT_MODULE
    )

    await bundledProductModuleService.deleteBundleItems(itemIds)
  }
)
