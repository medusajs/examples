import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { syncStep } from "./steps/sync";

export type SanitySyncProductsWorkflowInput = {
  product_ids?: string[];
};

export const sanitySyncProductsWorkflow = createWorkflow(
  { name: "sanity-sync-products", retentionTime: 10000 },
  function (input: SanitySyncProductsWorkflowInput) {
    const result = syncStep(input);

    return new WorkflowResponse(result);
  },
);
