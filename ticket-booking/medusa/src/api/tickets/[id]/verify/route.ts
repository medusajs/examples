import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { verifyTicketPurchaseWorkflow } from "../../../../workflows/verify-ticket-purchase"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  await verifyTicketPurchaseWorkflow(req.scope).run({
    input: {
      ticket_purchase_id: id
    }
  })
  
  res.json({
    success: true,
  })
}
