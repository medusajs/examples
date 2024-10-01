import { 
  AuthenticatedMedusaRequest, 
  MedusaNextFunction, 
  MedusaResponse
} from "@medusajs/medusa";
import {
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"
import { RESTAURANT_MODULE } from "../../modules/restaurant";

export const isDeliveryRestaurant = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const restaurantModuleService = req.scope.resolve(
    RESTAURANT_MODULE
  )

  const restaurantAdmin = await restaurantModuleService.retrieveRestaurantAdmin(
    req.auth_context.actor_id,
    {
      relations: ["restaurant"]
    }
  )

  const { data: [delivery] } = await query.graph({
    entity: "delivery",
    fields: [
      "restaurant.*"
    ],
    filters: {
      id: req.params.id
    }
  })

  if (delivery.restaurant.id !== restaurantAdmin.restaurant.id) {
    return res.status(403).json({
      message: "unauthorized"
    })
  }

  next()
}