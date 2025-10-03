import { promiseAll } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

type StepInput = {
  payment_session_ids: string[]
}

export const cancelPaymentSessionsStep = createStep(
  "cancel-payment-session",
  async ({ payment_session_ids }: StepInput, { container }) => {
    const paymentModuleService = container.resolve("payment")

    const paymentSessions = await paymentModuleService.listPaymentSessions({
      id: payment_session_ids,
    })

    const updatedPaymentSessions = await promiseAll(
      paymentSessions.map((session) => {
        return paymentModuleService.updatePaymentSession({
          id: session.id,
          status: "canceled",
          currency_code: session.currency_code,
          amount: session.amount,
          data: session.data,
        })
      })
    )

    return new StepResponse(updatedPaymentSessions, paymentSessions)
  },
  async (paymentSessions, { container }) => {
    if (!paymentSessions) {
      return
    }
    const paymentModuleService = container.resolve("payment")

    await promiseAll(
      paymentSessions.map((session) => {
        return paymentModuleService.updatePaymentSession({
          id: session.id,
          status: session.status,
          currency_code: session.currency_code,
          amount: session.amount,
          data: session.data,
        })
      })
    )
  }
)