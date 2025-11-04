import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { RENTAL_MODULE } from "../../modules/rental"
import RentalModuleService from "../../modules/rental/service"

type CreateRentalConfigurationInput = {
  product_id: string
  min_rental_days?: number
  max_rental_days?: number | null
  status?: "active" | "inactive"
}

export const createRentalConfigurationStep = createStep(
  "create-rental-configuration",
  async (
    input: CreateRentalConfigurationInput,
    { container }
  ) => {
    const rentalModuleService: RentalModuleService = container.resolve(
      RENTAL_MODULE
    )

    const rentalConfig = await rentalModuleService.createRentalConfigurations(
      input
    )

    return new StepResponse(rentalConfig, rentalConfig.id)
  },
  async (rentalConfigId, { container }) => {
    if (!rentalConfigId) return

    const rentalModuleService: RentalModuleService = container.resolve(
      RENTAL_MODULE
    )

    // Delete the created configuration on rollback
    await rentalModuleService.deleteRentalConfigurations(rentalConfigId)
  }
)

