import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { addToCartWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { getCustomPriceWorkflow } from "./get-custom-price";

type CustomAddToCartWorkflowInput = {
  item: {
    variant_id: string;
    quantity?: number;
    metadata?: Record<string, unknown>;
  }
  cart_id: string;
}

export const customAddToCartWorkflow = createWorkflow(
  "custom-add-to-cart",
  (input: CustomAddToCartWorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: ["region_id"],
      filters: {
        id: input.cart_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    })
    const price = getCustomPriceWorkflow.runAsStep({
      input: {
        variant_id: input.item.variant_id,
        region_id: carts[0].region_id!,
        metadata: input.item.metadata,
      }
    })

    const itemData = transform({
      item: input.item,
      price
    }, (data) => {
      return {
        variant_id: data.item.variant_id,
        quantity: data.item.quantity || 1,
        metadata: data.item.metadata,
        unit_price: data.price,
      }
    })

    addToCartWorkflow.runAsStep({
      input: {
        cart_id: input.cart_id,
        items: [itemData],
      }
    })

    // refetch the updated cart
    const { data: updatedCart } = useQueryGraphStep({
      entity: "cart",
      fields: ["*", "items.*",],
      filters: {
        id: input.cart_id,
      },
    }).config({ name: "refetch-cart" })

    return new WorkflowResponse({
      cart: updatedCart[0],
    })
  }
)