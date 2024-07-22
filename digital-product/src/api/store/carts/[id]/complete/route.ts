import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import createDigitalProductOrderWorkflow from "../../../../../workflows/create-digital-product-order";

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { result } = await createDigitalProductOrderWorkflow(req.scope)
    .run({
      input: {
        cart_id: req.params.id
      }
    })

  res.json({
    type: "order",
    ...result
  })
}