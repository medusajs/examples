import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { updateQuotesStep } from "./steps/update-quotes";
import { QuoteStatus } from "../modules/quote/models/quote";

type WorkflowInput = {
  id: string;
  status?: QuoteStatus;
}[]

export const updateQuotesWorkflow = createWorkflow(
  "update-quotes-workflow",
  function (input: WorkflowInput) {
    return new WorkflowResponse(updateQuotesStep(input));
  }
);
