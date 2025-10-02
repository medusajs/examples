import { CartDTO, OrderDTO, PaymentCollectionDTO } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { createStep } from "@medusajs/framework/workflows-sdk"

export type ValidateCartCancelationStepInput = {
  cart: CartDTO & {
    payment_collection?: PaymentCollectionDTO
    order?: OrderDTO
  }
}

export const validateCartCancelationStep = createStep(
  "validate-cart-cancelation",
  async ({ cart }: ValidateCartCancelationStepInput) => {
    if (cart.metadata?.checkout_session_canceled) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cart is already canceled"
      )
    }
    if (!!cart.order) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cart is already associated with an order"
      )
    }
    const invalidPaymentSessions = cart.payment_collection?.payment_sessions
      ?.some((session) => session.status === "authorized" || session.status === "canceled")

    if (!!cart.completed_at || !!invalidPaymentSessions) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cart cannot be canceled"
      )
    }
  }
)