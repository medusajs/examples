import {
  createWorkflow,
  WorkflowResponse,
  when
} from "@medusajs/workflows-sdk";
import { setStepSuccessStep } from "../steps/set-step-success";
import { setStepFailedStep } from "../steps/set-step-failed";
import { updateDeliveryStep } from "../steps/update-delivery";
import { UpdateDelivery } from "../../../modules/delivery/types";

export type WorkflowInput = {
  data: UpdateDelivery;
  stepIdToSucceed?: string;
  stepIdToFail?: string;
};

export const updateDeliveryWorkflow = createWorkflow(
  "update-delivery-workflow",
  function (input: WorkflowInput) {
    // Update the delivery with the provided data
    const updatedDelivery = updateDeliveryStep({
      data: input.data,
    });

    // If a stepIdToSucceed is provided, we will set that step as successful
    when(input, ({ stepIdToSucceed }) => stepIdToSucceed !== undefined)
      .then(() => {
        setStepSuccessStep({
          stepId: input.stepIdToSucceed,
          updatedDelivery,
        });
      })

    // If a stepIdToFail is provided, we will set that step as failed
    when(input, ({ stepIdToFail }) => stepIdToFail !== undefined)
      .then(() => {
        setStepFailedStep({
          stepId: input.stepIdToFail,
          updatedDelivery,
        });
      })

    // Return the updated delivery
    return new WorkflowResponse(updatedDelivery);
  }
);
