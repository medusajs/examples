import { cancelOrderWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"

cancelOrderWorkflow.hooks.orderCanceled(
  async ({ order }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // Retrieve all rentals associated with this order
    const { data: rentals } = await query.graph({
      entity: "rental",
      fields: ["id", "status", "variant_id"],
      filters: {
        order_id: order.id,
      },
    })

    // Validate that all rentals are in a cancelable state
    // Only pending, active, or already cancelled rentals can be part of a canceled order
    const nonCancelableRentals = rentals.filter(
      (rental: any) => !["pending", "active", "cancelled"].includes(rental.status)
    )

    if (nonCancelableRentals.length > 0) {
      const problematicRentals = nonCancelableRentals
        .map((r: any) => `${r.id} (${r.status})`)
        .join(", ")
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Cannot cancel order. Some rentals cannot be canceled: ${problematicRentals}. Only rentals with status "pending", "active", or "cancelled" can be canceled with the order.`
      )
    }
  }
)

