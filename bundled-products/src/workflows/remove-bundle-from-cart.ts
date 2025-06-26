import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deleteLineItemsWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows"

type RemoveBundleFromCartWorkflowInput = {
  bundle_id: string
  cart_id: string
}

export const removeBundleFromCartWorkflow = createWorkflow(
  "remove-bundle-from-cart",
  ({ bundle_id, cart_id }: RemoveBundleFromCartWorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: [
        "*",
        "items.*",
      ],
      filters: {
        id: cart_id,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    const itemsToRemove = transform({
      cart: carts[0],
      bundle_id,
    }, (data) => {
      return data.cart.items.filter((item) => {
        return item?.metadata?.bundle_id === data.bundle_id
      }).map((item) => item!.id)
    })

    deleteLineItemsWorkflow.runAsStep({
      input: {
        cart_id,
        ids: itemsToRemove,
      }
    })

    // retrieve cart again
    const { data: updatedCarts } = useQueryGraphStep({
      entity: "cart",
      fields: [
        "*",
        "items.*",
      ],
      filters: {
        id: cart_id,
      },
    }).config({ name: "retrieve-cart" })
    
    return new WorkflowResponse(updatedCarts[0])
  }
)