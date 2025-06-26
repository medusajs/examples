import {
  createWorkflow,
  transform,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import {
  useQueryGraphStep,
  updateCartPromotionsWorkflow,
  updateCartsStep,
  updatePromotionsStep
} from "@medusajs/medusa/core-flows"
import { getCartLoyaltyPromoStep } from "./steps/get-cart-loyalty-promo"
import { PromotionActions } from "@medusajs/framework/utils"
import { CartData } from "../utils/promo"

type WorkflowInput = {
  cart_id: string
}

const fields = [
  "id",
  "customer.*",
  "promotions.*",
  "promotions.application_method.*",
  "promotions.rules.*",
  "promotions.rules.values.*",
  "currency_code",
  "total",
  "metadata"
]

export const removeLoyaltyFromCartWorkflow = createWorkflow(
  "remove-loyalty-from-cart",
  (input: WorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields,
      filters: {
        id: input.cart_id
      }
    })

    const loyaltyPromo = getCartLoyaltyPromoStep({
      cart: carts[0] as unknown as CartData,
      throwErrorOn: "not-found"
    })

    updateCartPromotionsWorkflow.runAsStep({
      input: {
        cart_id: input.cart_id,
        promo_codes: [loyaltyPromo.code!],
        action: PromotionActions.REMOVE
      }
    })

    const newMetadata = transform({
      carts
    }, (data) => {
      const { loyalty_promo_id, ...rest } = data.carts[0].metadata || {}

      return {
        ...rest,
        loyalty_promo_id: null
      }
    })

    updateCartsStep([
      {
        id: input.cart_id,
        metadata: newMetadata
      }
    ])

    updatePromotionsStep([
      {
        id: loyaltyPromo.id,
        status: "inactive"
      }
    ])

    // retrieve cart with updated promotions
    const { data: updatedCarts } = useQueryGraphStep({
      entity: "cart",
      fields,
      filters: { id: input.cart_id },
    }).config({ name: "retrieve-cart" })

    return new WorkflowResponse(updatedCarts[0])
  }
)
