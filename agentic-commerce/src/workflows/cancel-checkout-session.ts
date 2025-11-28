import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { validateCartCancelationStep, ValidateCartCancelationStepInput } from "./steps/validate-cart-cancelation"
import { acquireLockStep, releaseLockStep, updateCartWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { cancelPaymentSessionsStep } from "./steps/cancel-payment-sessions"
import { prepareCheckoutSessionDataWorkflow } from "./prepare-checkout-session-data"

type WorkflowInput = {
  cart_id: string
}

export const cancelCheckoutSessionWorkflow = createWorkflow(
  "cancel-checkout-session",
  (input: WorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: [
        "id", 
        "payment_collection.*", 
        "payment_collection.payment_sessions.*",
        "order.id"
      ],
      filters: {
        id: input.cart_id,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    validateCartCancelationStep({
      cart: carts[0],
    } as unknown as ValidateCartCancelationStepInput)

    acquireLockStep({
      key: input.cart_id,
      timeout: 2,
      ttl: 10,
    })
    
    when({
      carts
    }, (data) => !!data.carts[0].payment_collection?.payment_sessions?.length)
    .then(() => {
      const paymentSessionIds = transform({
        carts
      }, (data) => {
        return data.carts[0].payment_collection?.payment_sessions?.map((session) => session!.id)
      })
      cancelPaymentSessionsStep({
        payment_session_ids: paymentSessionIds,
      })
    })

    updateCartWorkflow.runAsStep({
      input: {
        id: carts[0].id,
        metadata: {
          checkout_session_canceled: true,
        }
      }
    })

    const responseData = prepareCheckoutSessionDataWorkflow.runAsStep({
      input: {
        cart_id: carts[0].id,
      }
    })

    releaseLockStep({
      key: input.cart_id,
    })

    return new WorkflowResponse(responseData)
  }
)