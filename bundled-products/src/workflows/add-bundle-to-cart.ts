import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { addToCartWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { prepareBundleCartDataStep, PrepareBundleCartDataStepInput } from "./steps/prepare-bundle-cart-data"

type AddBundleToCartWorkflowInput = {
  cart_id: string
  bundle_id: string
  quantity: number
  items: {
    item_id: string
    variant_id: string
  }[]
}

export const addBundleToCartWorkflow = createWorkflow(
  "add-bundle-to-cart",
  ({ cart_id, bundle_id, quantity, items }: AddBundleToCartWorkflowInput) => {
    const { data } = useQueryGraphStep({
      entity: "bundle",
      fields: [
        "id",
        "items.*",
        "items.product.*",
        "items.product.variants.*"
      ],
      filters: {
        id: bundle_id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })
    
    const itemsToAdd = prepareBundleCartDataStep({
      bundle: data[0],
      quantity,
      items
    } as unknown as PrepareBundleCartDataStepInput)

    addToCartWorkflow.runAsStep({
      input: {
        cart_id,
        items: itemsToAdd
      }
    })

    const { data: updatedCarts } = useQueryGraphStep({
      entity: "cart",
      filters: { id: cart_id },
      fields: ["id", "items.*"],
    }).config({ name: "refetch-cart" })

    return new WorkflowResponse(updatedCarts[0])
  }
)