import {
  createWorkflow,
  WorkflowResponse,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import { updateCartPromotionsWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { PromotionActions } from "@medusajs/framework/utils"
import { validateTierPromotionStep } from "./steps/validate-tier-promotion"

export type AddTierPromotionToCartWorkflowInput = {
  cart_id: string
}

export const addTierPromotionToCartWorkflow = createWorkflow(
  "add-tier-promotion-to-cart",
  (input: AddTierPromotionToCartWorkflowInput) => {
    // Get cart with customer, tier, and promotions
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: [
        "id",
        "customer.id",
        "customer.has_account",
        "customer.tier.*",
        "customer.tier.promotion.id",
        "customer.tier.promotion.code",
        "customer.tier.promotion.status",
        "promotions.*",
        "promotions.code",
      ],
      filters: {
        id: input.cart_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    })


    // Check if customer exists and has tier
    const validationResult = when({ carts }, (data) => !!data.carts[0].customer).then(() => {
      return validateTierPromotionStep({
        customer: {
          has_account: carts[0].customer!.has_account,
          tier: {
            promo_id: carts[0].customer!.tier!.promo_id || null,
            promotion: {
              id: carts[0].customer!.tier!.promotion!.id,
              code: carts[0].customer!.tier!.promotion!.code || null,
              // @ts-ignore
              status: carts[0].customer!.tier!.promotion!.status || null,
            },
          },
        },
      })
    })

    // Add promotion to cart if valid and not already applied
    when({ validationResult, carts }, (data) => {
      if (!data.validationResult?.promotion_code) {
        return false
      }

      const appliedPromotionCodes = data.carts[0].promotions?.map(
        (promo: any) => promo.code
      ) || []

      return (
        data.validationResult?.promotion_code !== null &&
        !appliedPromotionCodes.includes(data.validationResult?.promotion_code!)
      )
    }).then(() => {
      return updateCartPromotionsWorkflow.runAsStep({
        input: {
          cart_id: input.cart_id,
          promo_codes: [validationResult?.promotion_code!],
          action: PromotionActions.ADD,
        },
      })
    })

    return new WorkflowResponse(void 0)
  }
)

