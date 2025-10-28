import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { RENTAL_MODULE } from "../../modules/rental"
import RentalModuleService from "../../modules/rental/service"
import { OrderDTO } from "@medusajs/framework/types"

export type CreateRentalsForOrderInput = {
  order: OrderDTO
}

export const createRentalsForOrderStep = createStep(
  "create-rentals-for-order",
  async ({ order }: CreateRentalsForOrderInput, { container }) => {
    const rentalModuleService: RentalModuleService = container.resolve(RENTAL_MODULE)

    const rentalItems = (order.items || []).filter((item) => {
      return item.metadata?.rental_start_date && 
        item.metadata?.rental_end_date && item.metadata?.rental_days
    })

    if (rentalItems.length === 0) {
      return new StepResponse([])
    }

    const rentals = await rentalModuleService.createRentals(
      rentalItems.map((item) => {
        const { 
          variant_id,
          metadata,
        } = item
        const rentalConfiguration = (item as any).variant?.product?.rental_configuration

        return {
          variant_id: variant_id!,
          customer_id: order.customer_id,
          order_id: order.id,
          line_item_id: item.id,
          rental_start_date: new Date(metadata?.rental_start_date as string),
          rental_end_date: new Date(metadata?.rental_end_date as string),
          rental_days: Number(metadata?.rental_days),
          rental_configuration_id: rentalConfiguration?.id as string,
        }
      })
    )

    return new StepResponse(
      rentals,
      rentals.map((rental) => rental.id)
    )
  },
  async (rentalIds, { container }) => {
    if (!rentalIds) return

    const rentalModuleService: RentalModuleService = container.resolve(RENTAL_MODULE)

    // Delete all created rentals on rollback
    await rentalModuleService.deleteRentals(rentalIds)
  }
)

