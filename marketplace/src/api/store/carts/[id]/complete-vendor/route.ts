import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework";
import createVendorOrdersWorkflow from "../../../../../workflows/marketplace/create-vendor-orders";

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const cartId = req.params.id

  const { result } = await createVendorOrdersWorkflow(req.scope)
    .run({
      input: {
        cart_id: cartId
      }
    })

  res.json({
    type: "order",
    order: result.order
  })
}