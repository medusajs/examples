import {
  ModuleRegistrationName,
  TransactionHandlerType,
} from "@medusajs/utils";
import { StepResponse, createStep } from "@medusajs/workflows-sdk";
import { Delivery } from "../../../modules/delivery/types";
import { handleDeliveryWorkflowId } from "../../delivery/workflows/handle-delivery";

type SetStepFailedtepInput = {
  stepId: string;
  updatedDelivery: Delivery;
};

export const setStepFailedStep = createStep(
  "set-step-failed-step",
  async function (
    { stepId, updatedDelivery }: SetStepFailedtepInput,
    { container }
  ) {
    const engineService = container.resolve(
      ModuleRegistrationName.WORKFLOW_ENGINE
    );

    await engineService.setStepFailure({
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
