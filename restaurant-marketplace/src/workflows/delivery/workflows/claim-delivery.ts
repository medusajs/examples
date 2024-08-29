import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { DeliveryStatus } from "../../../modules/delivery/types";
import { awaitDriverClaimStepId } from "../steps/await-driver-claim";
import { setStepSuccessStep } from "../steps/set-step-success";
import { updateDeliveryStep } from "../steps/update-delivery";

export type ClaimWorkflowInput = {
  driver_id: string;
  delivery_id: string;
};

export const claimDeliveryWorkflow = createWorkflow(
  "claim-delivery-workflow",
  function (input: ClaimWorkflowInput) {
    // Update the delivery with the provided data
    const claimedDelivery = updateDeliveryStep({
      data: {
        id: input.delivery_id,
        driver_id: input.driver_id,
        delivery_status: DeliveryStatus.PICKUP_CLAIMED,
      },
    });

    // Set the step success for the find driver step
    setStepSuccessStep({
      stepId: awaitDriverClaimStepId,
      updatedDelivery: claimedDelivery,
    });

    // Return the updated delivery
    return new WorkflowResponse(claimedDelivery);
  }
);
