import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const eventService = req.scope.resolve("event_bus")

  await eventService.emit({
    name: "products.sync",
    data: {},
  })

  res.status(200).json({
    message: "Products sync triggered successfully",
  })
}
