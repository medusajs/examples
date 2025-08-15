import { 
  createWorkflow, 
  WorkflowResponse,
  transform
} from "@medusajs/framework/workflows-sdk"
import { deleteLineItemsWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows"

type RemoveProductBuilderFromCartInput = {
  cart_id: string
  line_item_id: string
}

export const removeProductBuilderFromCartWorkflow = createWorkflow(
  "remove-product-builder-from-cart",
  (input: RemoveProductBuilderFromCartInput) => {
    // Step 1: Get current cart with all items
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: ["*", "items.*"],
      filters: {
        id: input.cart_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    })

    // Step 2: Remove line item and its addons
    const itemsToRemove = transform({
      input,
      currentCart: carts
    }, (data) => {
      const cart = data.currentCart[0]
      const targetLineItem = cart.items.find((item: any) => item.id === data.input.line_item_id)
      const lineItemIdsToRemove = [data.input.line_item_id]
      const isBuilderItem = targetLineItem?.metadata?.is_builder_main_product === true
      
      if (targetLineItem && isBuilderItem) {
        // Find all related addon items
        const relatedItems = cart.items.filter((item: any) => 
          item.metadata?.main_product_line_item_id === data.input.line_item_id &&
          item.metadata?.is_addon === true
        )
        
        // Add their IDs to the removal list
        lineItemIdsToRemove.push(
          ...relatedItems.map((item: any) => item.id)
        )
      }

      return {
        cart_id: data.input.cart_id,
        ids: lineItemIdsToRemove
      }
    })

    deleteLineItemsWorkflow.runAsStep({
      input: itemsToRemove
    })

    // Step 3: Get the updated cart
    const { data: updatedCart } = useQueryGraphStep({
      entity: "cart",
      fields: ["*", "items.*", "items.metadata"],
      filters: {
        id: input.cart_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    }).config({ name: "get-updated-cart" })

    return new WorkflowResponse({
      cart: updatedCart[0],
    })
  }
)
