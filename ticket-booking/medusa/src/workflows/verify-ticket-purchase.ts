import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { verifyTicketPurchaseStep } from "./steps/verify-ticket-purchase-step"
import { updateTicketPurchaseStatusStep } from "./steps/update-ticket-purchase-status-step"

export type VerifyTicketPurchaseWorkflowInput = {
  ticket_purchase_id: string
}

export const verifyTicketPurchaseWorkflow = createWorkflow(
  "verify-ticket-purchase",
  function (input: VerifyTicketPurchaseWorkflowInput) {
    verifyTicketPurchaseStep(input)
    
    const ticketPurchase = updateTicketPurchaseStatusStep({
      ticket_purchase_id: input.ticket_purchase_id,
      status: "scanned"
    })

    return new WorkflowResponse(ticketPurchase)
  }
)
