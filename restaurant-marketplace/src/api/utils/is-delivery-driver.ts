import { 
  AuthenticatedMedusaRequest, 
  MedusaNextFunction, 
  MedusaResponse
} from "@medusajs/framework";
import { DELIVERY_MODULE } from "../../modules/delivery";
import DeliveryModuleService from "../../modules/delivery/service";

export const isDeliveryDriver = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const deliveryModuleService: DeliveryModuleService = req.scope.resolve(
    DELIVERY_MODULE
  )

  const delivery = await deliveryModuleService.retrieveDelivery(
    req.params.id,
    {
      relations: ["driver"]
    }
  )

  if (delivery.driver.id !== req.auth_context.actor_id) {
    return res.status(403).json({
      message: "unauthorized"
    })
  }

  next()
}