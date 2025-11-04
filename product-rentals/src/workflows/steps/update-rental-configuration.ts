import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { RENTAL_MODULE } from "../../modules/rental"
import RentalModuleService from "../../modules/rental/service"

type UpdateRentalConfigurationInput = {
  id: string
  min_rental_days?: number
  max_rental_days?: number | null
  status?: "active" | "inactive"
}

export const updateRentalConfigurationStep = createStep(
  "update-rental-configuration",
  async (
    input: UpdateRentalConfigurationInput,
    { container }
  ) => {
    const rentalModuleService: RentalModuleService = container.resolve(RENTAL_MODULE)
    
    // retrieve existing rental configuration
    const existingRentalConfig = await rentalModuleService.retrieveRentalConfiguration(
      input.id
    )

    const updatedRentalConfig = await rentalModuleService.updateRentalConfigurations(
      input
    )

    return new StepResponse(updatedRentalConfig, existingRentalConfig)
  },
  async (existingRentalConfig, { container }) => {
    if (!existingRentalConfig) return

    const rentalModuleService: RentalModuleService = container.resolve(RENTAL_MODULE)

    await rentalModuleService.updateRentalConfigurations({
      id: existingRentalConfig.id,
      min_rental_days: existingRentalConfig.min_rental_days,
      max_rental_days: existingRentalConfig.max_rental_days,
      status: existingRentalConfig.status,
    })
  }
)

