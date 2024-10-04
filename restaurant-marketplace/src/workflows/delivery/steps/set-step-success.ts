import {
  Modules,
  TransactionHandlerType,
} from "@medusajs/framework/utils";
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk";
import { Delivery } from "../../../modules/delivery/types";
import { handleDeliveryWorkflowId } from "../workflows/handle-delivery";

type SetStepSuccessStepInput = {
  stepId: string;
  updatedDelivery: Delivery;
};

export const setStepSuccessStep = createStep(
  "set-step-success-step",
  async function (
    { stepId, updatedDelivery }: SetStepSuccessStepInput,
    { container }
  ) {
    const engineService = container.resolve(
      Modules.WORKFLOW_ENGINE
    );

    await engineService.setStepSuccess({
      idempotencyKey: {
        action: TransactionHandlerType.INVOKE,
        transactionId: updatedDelivery.transaction_id,
        stepId,
        workflowId: handleDeliveryWorkflowId,
      },
      stepResponse: new StepResponse(updatedDelivery, updatedDelivery.id),
      options: {
        container,
      },
    });
  }
);
