import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

type GetEmailStepInput = {
  email?: string
  customer_id?: string
}

export const getEmailStep = createStep(
  "get-email",
  async ({ email, customer_id }: GetEmailStepInput, { container }) => {
    if (!email && !customer_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Either `email` or `customer_id` is required."
      )
    }

    let returnedEmail = email
    const query = container.resolve("query")

    if (!email) {
      const { data: customers } = await query.graph({
        entity: "customer",
        fields: ["email"],
        filters: {
          id: customer_id
        }
      })

      returnedEmail = customers[0].email
    }

    return new StepResponse(returnedEmail)
  }
)