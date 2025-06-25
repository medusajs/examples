import { 
  updateCartPromotionsWorkflow,
  completeCartWorkflow
} from "@medusajs/medusa/core-flows"
import { FIRST_PURCHASE_PROMOTION_CODE } from "../../constants"
import { MedusaError } from "@medusajs/framework/utils"

updateCartPromotionsWorkflow.hooks.validate(
  (async ({ input, cart }, { container }) => {
    const hasFirstPurchasePromo = input.promo_codes?.some((code) => code === FIRST_PURCHASE_PROMOTION_CODE)

    if (!hasFirstPurchasePromo) {
      return
    }

    if (!cart.customer_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "First purchase discount can only be applied to carts with a customer"
      )
    }
    const query = container.resolve("query")

    const { data: [customer] } = await query.graph({
      entity: "customer",
      fields: ["orders.*", "has_account"],
      filters: {
        id: cart.customer_id
      }
    })

    if (!customer.has_account || (customer?.orders?.length || 0) > 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "First purchase discount can only be applied to carts with no previous orders"
      )
    }
  })
)

completeCartWorkflow.hooks.validate(
  (async ({ input, cart }, { container }) => {
    const hasFirstPurchasePromo = cart.promotions?.some(
      (promo) => promo?.code === FIRST_PURCHASE_PROMOTION_CODE
    )

    if (!hasFirstPurchasePromo) {
      return
    }

    if (!cart.customer_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "First purchase discount can only be applied to carts with a customer"
      )
    }

    const query = container.resolve("query")

    const { data: [customer] } = await query.graph({
      entity: "customer",
      fields: ["orders.*", "has_account"],
      filters: {
        id: cart.customer_id
      }
    })

    if (!customer.has_account || (customer?.orders?.length || 0) > 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "First purchase discount can only be applied to carts with no previous orders"
      )
    }
  })
)
