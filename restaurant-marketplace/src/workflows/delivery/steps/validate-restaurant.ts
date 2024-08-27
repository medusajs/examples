import { 
  createStep
} from "@medusajs/workflows-sdk"
import { RESTAURANT_MODULE } from "../../../modules/restaurant"

type ValidateRestaurantStepInput = {
  restaurant_id: string
}

export const validateRestaurantStep = createStep(
  "validate-restaurant",
  async ({ restaurant_id }: ValidateRestaurantStepInput, { container }) => {
    const restaurantModuleService = container.resolve(
      RESTAURANT_MODULE
    )

    // if a restaurant with the ID doesn't exist, an error is thrown
    await restaurantModuleService.retrieveRestaurant(
      restaurant_id
    )
  }
)