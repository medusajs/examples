import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { addToCartWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { getVariantMetalPricesStep, GetVariantMetalPricesStepInput } from "./steps/get-variant-metal-prices"
import { QueryContext } from "@medusajs/framework/utils"

type AddCustomToCartWorkflowInput = {
  cart_id: string
  item: {
    variant_id: string
    quantity: number
    metadata?: Record<string, unknown>
  }
}

export const addCustomToCartWorkflow = createWorkflow(
  "add-custom-to-cart",
  ({ cart_id, item }: AddCustomToCartWorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      filters: { id: cart_id },
      fields: ["id", "currency_code"],
    })

    const { data: variants } = useQueryGraphStep({
      entity: "variant",
      fields: [
        "*",
        "options.*",
        "options.option.*",
        "calculated_price.*"
      ],
      filters: {
        id: item.variant_id
      },
      options: {
        throwIfKeyNotFound: true
      },
      context: {
        calculated_price: QueryContext({
          currency_code: carts[0].currency_code
        })
      }
    }).config({ name: "retrieve-variant" })
    
    const price = getVariantMetalPricesStep({
      variant: variants[0],
      currencyCode: carts[0].currency_code,
      quantity: item.quantity
    } as unknown as GetVariantMetalPricesStepInput)

    const itemToAdd = transform({
      item,
      price
    }, (data) => {
      return [{
        ...data.item,
        unit_price: data.price
      }]
    })

    addToCartWorkflow.runAsStep({
      input: {
        items: itemToAdd,
        cart_id
      }
    })

    const { data: updatedCarts } = useQueryGraphStep({
      entity: "cart",
      filters: { id: cart_id },
      fields: ["id", "items.*"],
    }).config({ name: "refetch-cart" })

    return new WorkflowResponse({
      cart: updatedCarts[0]
    })
  }
)