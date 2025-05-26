import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customer_id = req.auth_context?.actor_id
  
  const eventModuleService = req.scope.resolve("event_bus")

  await eventModuleService.emit({
    name: "product.viewed",
    data: {
      id: req.params.id,
      customer_id,
    },
  })

  res.send({
    success: true,
  })
}
