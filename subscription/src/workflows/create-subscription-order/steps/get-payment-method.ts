import { MedusaError, Modules } from "@medusajs/framework/utils"
import { AccountHolderDTO, CustomerDTO, PaymentMethodDTO } from "@medusajs/framework/types"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export interface GetPaymentMethodStepInput {
  customer: CustomerDTO & {
    account_holder: AccountHolderDTO
  }
}

// Since we know we are using Stripe, we can get the correct creation date from their data.
const getLatestPaymentMethod = (paymentMethods: PaymentMethodDTO[]) => {
  return paymentMethods.sort(
    (a, b) =>
      ((b.data?.created as number) ?? 0) - ((a.data?.created as number) ?? 0)
  )[0]
}

export const getPaymentMethodStep = createStep(
  "get-payment-method",
  async ({ customer }: GetPaymentMethodStepInput, { container }) => {
    const paymentModuleService = container.resolve(Modules.PAYMENT)

    if (!customer.account_holder) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "No account holder found for the customer while retrieving payment method"
      )
    }

    const paymentMethods = await paymentModuleService.listPaymentMethods(
      {
        // you can change to other payment provider
        provider_id: "pp_stripe_stripe",
        context: {
          account_holder: customer.account_holder,
        },
      },
    )

    if (!paymentMethods.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "At least one saved payment method is required for performing a payment"
      )
    }

    const paymentMethodToUse = getLatestPaymentMethod(paymentMethods)

    return new StepResponse(
      paymentMethodToUse,
      customer.account_holder
    )
  }
)