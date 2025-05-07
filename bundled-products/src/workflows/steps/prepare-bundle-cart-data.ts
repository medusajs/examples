import { InferTypeOf, ProductDTO } from "@medusajs/framework/types"
import { Bundle } from "../../modules/bundled-product/models/bundle"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { BundleItem } from "../../modules/bundled-product/models/bundle-item"

type BundleItemWithProduct = InferTypeOf<typeof BundleItem> & {
  product: ProductDTO
}

export type PrepareBundleCartDataStepInput = {
  bundle: InferTypeOf<typeof Bundle> & {
    items: BundleItemWithProduct[]
  }
  quantity: number
  items: {
    item_id: string
    variant_id: string
  }[]
}

export const prepareBundleCartDataStep = createStep(
  "prepare-bundle-cart-data",
  async ({ bundle, quantity, items }: PrepareBundleCartDataStepInput) => {
    const bundleItems = bundle.items.map((item: BundleItemWithProduct) => {
      const selectedItem = items.find((i) => i.item_id === item.id)
      if (!selectedItem) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA, 
          `No variant selected for bundle item ${item.id}`
        )
      }
      const variant = item.product.variants.find((v) => v.id === selectedItem.variant_id)
      if (!variant) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA, 
          `Variant ${selectedItem.variant_id} is invalid for bundle item ${item.id}`
        )
      }
      return {
        variant_id: selectedItem.variant_id,
        quantity: item.quantity * quantity,
        metadata: {
          bundle_id: bundle.id,
          quantity: quantity
        }
      }
    })

    return new StepResponse(bundleItems)
  }  
)