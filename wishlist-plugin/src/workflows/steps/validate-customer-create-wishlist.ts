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
      entity: "customer",
      fields: ["wishlist.*"],
      filters: {
        id: customer_id
      }
    })

    if (!data.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Specified customer was not found",
      )
    }

    if (data[0].wishlist) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Customer already has a wishlist",
      )
    }
  },
)