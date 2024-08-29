import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { DELIVERY_MODULE } from "../../../../modules/delivery"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const deliveryModuleService = req.scope.resolve(DELIVERY_MODULE)

  const delivery = await deliveryModuleService.retrieveDelivery(
    req.params.id
  )

  res.json({
    delivery
  })
}