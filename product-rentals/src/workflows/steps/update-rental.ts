import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { RENTAL_MODULE } from "../../modules/rental"
import RentalModuleService from "../../modules/rental/service"
import { MedusaError } from "@medusajs/framework/utils"

type UpdateRentalInput = {
  rental_id: string
  status: "active" | "returned" | "cancelled"
}

export const updateRentalStep = createStep(
  "update-rental",
  async ({ rental_id, status }: UpdateRentalInput, { container }) => {
    const rentalModuleService: RentalModuleService = container.resolve(RENTAL_MODULE)

    const existingRental = await rentalModuleService.retrieveRental(rental_id)
    let actualReturnDate = status === "returned" ? new Date() : null

    if (status === "active" && existingRental.status !== "pending") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA, 
        "Can't activate a rental that is not in a pending state."
      )
    }

    if (status === "returned" && existingRental.status !== "active") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Can't return a rental that is not in an active state."
      )
    }
    
    if (status === "cancelled" && !["active", "pending"].includes(existingRental.status)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Can't cancel a rental that is not in an active or pending state."
      )
    }
    
    const updatedRental = await rentalModuleService.updateRentals({
      id: rental_id,
      status,
      actual_return_date: actualReturnDate,
    })

    return new StepResponse(updatedRental, existingRental)
  },
  async (existingRental, { container }) => {
    if (!existingRental) return

    const rentalModuleService: RentalModuleService = container.resolve(RENTAL_MODULE)

    await rentalModuleService.updateRentals({
      id: existingRental.id,
      status: existingRental.status,
      actual_return_date: existingRental.actual_return_date,
    })
  }
)

