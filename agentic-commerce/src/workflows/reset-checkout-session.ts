import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { refreshPaymentCollectionForCartWorkflow } from "@medusajs/medusa/core-flows"

type WorkflowInput = {
  cart_id: string
}

export const resetCheckoutSessionWorkflow = createWorkflow(
  "reset-checkout-session",
  (input: WorkflowInput) => {
    return refreshPaymentCollectionForCartWorkflow.runAsStep({
      input: {
        cart_id: input.cart_id,
      }
    })
  }
)