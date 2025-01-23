import { MedusaError } from "@medusajs/framework/utils"
import { createStep } from "@medusajs/framework/workflows-sdk"

type ValidateCustomerCreateWishlistStepInput = {
  customer_id: string
}

export const validateCustomerCreateWishlistStep = createStep(
  "validate-customer-create-wishlist",
  async ({ customer_id }: ValidateCustomerCreateWishlistStepInput, { container }) => {
    const query = container.resolve("query")

    const { data } = await query.graph({
      entity: "wishlist",
      fields: ["*"],
      filters: {
        customer_id: customer_id
      }
    })

    if (data.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Customer already has a wishlist",
      )
    }

    // check that customer exists
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["*"],
      filters: {
        id: customer_id
      }
    })

    if (customers.length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Specified customer was not found",
      )
    }
  },
)