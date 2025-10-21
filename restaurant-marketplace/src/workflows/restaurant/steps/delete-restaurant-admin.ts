import {
  createStep,
  StepResponse
} from "@medusajs/framework/workflows-sdk"
import { RESTAURANT_MODULE } from "../../../modules/restaurant"
import { DeleteRestaurantAdminWorkflow } from "../workflows/delete-restaurant-admin"
import RestaurantModuleService from "../../../modules/restaurant/service"

export const deleteRestaurantAdminStep = createStep(
  "delete-restaurant-admin",
  async ({ id }: DeleteRestaurantAdminWorkflow, { container }) => {
    const restaurantModuleService: RestaurantModuleService = container.resolve(
      RESTAURANT_MODULE
    )

    const admin = await restaurantModuleService.retrieveRestaurantAdmin(id)

    await restaurantModuleService.deleteRestaurantAdmins(id)
    
    return new StepResponse(undefined, { admin })
  },
  async (data, { container }) => {
    if (!data) {
      return
    }
    const restaurantModuleService: RestaurantModuleService = container.resolve(
      RESTAURANT_MODULE
    )

    const { restaurant: _, ...adminData } = data.admin

    await restaurantModuleService.createRestaurantAdmins(adminData)
  }
)