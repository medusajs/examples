import {
  createStep,
  StepResponse
} from "@medusajs/workflows-sdk"
import { RESTAURANT_MODULE } from "../../../modules/restaurant"
import { DeleteRestaurantAdminWorkflow } from "../workflows/delete-restaurant-admin"

export const deleteRestaurantAdminStep = createStep(
  "delete-restaurant-admin",
  async ({ id }: DeleteRestaurantAdminWorkflow, { container }) => {
    const restaurantModuleService = container.resolve(
      RESTAURANT_MODULE
    )

    const admin = await restaurantModuleService.retrieveRestaurantAdmin(id)

    await restaurantModuleService.deleteRestaurantAdmins(id)
    
    return new StepResponse(undefined, { admin })
  },
  async ({ admin }, { container }) => {
    const restaurantModuleService = container.resolve(
      RESTAURANT_MODULE
    )

    await restaurantModuleService.createRestaurantAdmins(admin)
  }
)