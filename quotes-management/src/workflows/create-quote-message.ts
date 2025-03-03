import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { createQuoteMessageStep } from "./steps/create-quote-message";

type WorkflowInput = {
  text: string;
  quote_id: string;
  admin_id?: string;
  customer_id?: string;
  item_id?: string | null;
}

export const createQuoteMessageWorkflow = createWorkflow(
  "create-quote-message-workflow",
  (input: WorkflowInput) => {
    return new WorkflowResponse(createQuoteMessageStep(input));
  }
);
