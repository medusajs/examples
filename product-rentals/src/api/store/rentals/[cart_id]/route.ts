import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createRentalsWorkflow } from "../../../../workflows/create-rentals"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { cart_id } = req.params

  const { result } = await createRentalsWorkflow(req.scope).run({
    input: {
      cart_id,
    },
  })

  res.json({
    type: "order",
    order: result.order,
  })
}

