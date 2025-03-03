import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { createQuotesStep } from "./steps/create-quotes";

type WorkflowInput = {
  draft_order_id: string;
  order_change_id: string;
  cart_id: string;
  customer_id: string;
}[]

export const createQuotesWorkflow = createWorkflow(
  "create-quotes-workflow",
  (input: WorkflowInput) => {
    return new WorkflowResponse(createQuotesStep(input));
  }
);
