import { createWorkflow, when } from "@medusajs/framework/workflows-sdk"
import { updatePromotionsStep, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { validateCustomerExistsStep, ValidateCustomerExistsStepInput } from "./steps/validate-customer-exists"
import { deductPurchasePointsStep } from "./steps/deduct-purchase-points"
import { addPurchaseAsPointsStep } from "./steps/add-purchase-as-points"
import { OrderData, CartData } from "../utils/promo"
import { orderHasLoyaltyPromotion } from "../utils/promo"
import { getCartLoyaltyPromoStep } from "./steps/get-cart-loyalty-promo"

type WorkflowInput = {
  order_id: string
}

export const handleOrderPointsWorkflow = createWorkflow(
  "handle-order-points",
  ({ order_id }: WorkflowInput) => {
    // @ts-ignore
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id", 
        "customer.*", 
        "total", 
        "cart.*",
        "cart.promotions.*",
        "cart.promotions.rules.*",
        "cart.promotions.rules.values.*",
        "cart.promotions.application_method.*"
      ],
      filters: {
        id: order_id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    validateCustomerExistsStep({
      customer: orders[0].customer
    } as ValidateCustomerExistsStepInput)

    const loyaltyPointsPromotion = getCartLoyaltyPromoStep({
      cart: orders[0].cart as unknown as CartData,
    })

    when(orders, (orders) => 
      orderHasLoyaltyPromotion(orders[0] as unknown as OrderData) && 
      loyaltyPointsPromotion !== undefined
    )
    .then(() => {
      deductPurchasePointsStep({
        customer_id: orders[0].customer!.id,
        amount: loyaltyPointsPromotion.application_method!.value as number
      })

      updatePromotionsStep([
        {
          id: loyaltyPointsPromotion.id,
          status: "inactive",
        }
      ])
    })


    when(orders, (order) => !orderHasLoyaltyPromotion(order[0] as unknown as OrderData))
    .then(() => {
      addPurchaseAsPointsStep({
        customer_id: orders[0].customer!.id,
        amount: orders[0].total
      })
    })
  }
)
