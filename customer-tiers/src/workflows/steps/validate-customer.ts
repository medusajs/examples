import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

export type ValidateCustomerStepInput = {
  customer: any
}

export const validateCustomerStep = createStep(
  "validate-customer",
  async (input: ValidateCustomerStepInput, { container }) => {
    if (!input.customer) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Customer not found"
      )
    }

    if (!input.customer.has_account) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Customer must be registered to be assigned a tier"
      )
    }

    return new StepResponse(input.customer)
  }
)

