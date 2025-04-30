import { CreateProductWorkflowInputDTO } from "@medusajs/framework/types"
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createBundleStep } from "./steps/create-bundle"
import { createBundleItemsStep } from "./steps/create-bundle-items"
import { createProductsWorkflow, createRemoteLinkStep, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { BUNDLED_PRODUCT_MODULE } from "../modules/bundled-product"
import { Modules } from "@medusajs/framework/utils"

export type CreateBundledProductWorkflowInput = {
  bundle: {
    title: string
    product: CreateProductWorkflowInputDTO
    items: {
      product_id: string
      quantity: number
    }[]
  }
}

export const createBundledProductWorkflow = createWorkflow(
  "create-bundled-product",
  ({ bundle: bundleData }: CreateBundledProductWorkflowInput) => {
    const bundle = createBundleStep({
      title: bundleData.title,
    })

    const bundleItems = createBundleItemsStep({
      bundle_id: bundle.id,
      items: bundleData.items,
    })
    
    const bundleProduct = createProductsWorkflow.runAsStep({
      input: {
        products: [bundleData.product],
      }
    })

    createRemoteLinkStep([{
      [BUNDLED_PRODUCT_MODULE]: {
        bundle_id: bundle.id,
      },
      [Modules.PRODUCT]: {
        product_id: bundleProduct[0].id,
      },
    }])

    const bundleProducttemLinks = transform({
      bundleData,
      bundleItems
    }, (data) => {
      return data.bundleItems.map((item, index) => ({
        [BUNDLED_PRODUCT_MODULE]: {
          bundle_item_id: item.id,
        },
        [Modules.PRODUCT]: {
          product_id: data.bundleData.items[index].product_id,
        },
      }))
    })

    createRemoteLinkStep(bundleProducttemLinks).config({
      name: "create-bundle-product-items-links",
    })

    // retrieve bundle product wit items
    // @ts-ignore
    const { data } = useQueryGraphStep({
      entity: "bundle",
      fields: ["*", "items.*"],
      filters: {
        id: bundle.id,
      },
    })

    return new WorkflowResponse(data[0])
  }
)
