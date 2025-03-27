import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { DELIVERY_MODULE } from "../../../../modules/delivery"
import DeliveryModuleService from "../../../../modules/delivery/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const deliveryModuleService: DeliveryModuleService = req.scope.resolve(DELIVERY_MODULE)

  const delivery = await deliveryModuleService.retrieveDelivery(
    req.params.id
  )

  res.json({
    delivery
  })
}