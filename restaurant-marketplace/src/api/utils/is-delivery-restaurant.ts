import { 
  AuthenticatedMedusaRequest, 
  MedusaNextFunction, 
  MedusaResponse
} from "@medusajs/medusa";
import {
  remoteQueryObjectFromString,
} from "@medusajs/utils"
import { RESTAURANT_MODULE } from "../../modules/restaurant";

export const isDeliveryRestaurant = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const remoteQuery = req.scope.resolve("remoteQuery")
  const restaurantModuleService = req.scope.resolve(
    RESTAURANT_MODULE
  )

  const restaurantAdmin = await restaurantModuleService.retrieveRestaurantAdmin(
    req.auth_context.actor_id,
    {
      relations: ["restaurant"]
    }
  )

  const query = remoteQueryObjectFromString({
    entryPoint: "delivery",
    fields: [
      "restaurant.*"
    ],
    variables: {
      filters: {
        id: req.params.id
      }
    }
  })

  const result = await remoteQuery(query)

  if (result[0].restaurant.id !== restaurantAdmin.restaurant.id) {
    return res.status(403).json({
      message: "unauthorized"
    })
  }

  next()
}