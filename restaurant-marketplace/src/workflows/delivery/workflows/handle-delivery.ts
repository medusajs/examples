import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk";
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { setTransactionIdStep } from "../steps/set-transaction-id";
import { notifyRestaurantStep } from "../steps/notify-restaurant";
import { awaitDriverClaimStep } from "../steps/await-driver-claim";
import { createOrderStep } from "../steps/create-order";
import { awaitStartPreparationStep } from "../steps/await-start-preparation";
import { awaitPreparationStep } from "../steps/await-preparation";
import { createFulfillmentStep } from "../steps/create-fulfillment";
import { awaitPickUpStep } from "../steps/await-pick-up";
import { awaitDeliveryStep } from "../steps/await-delivery";

type WorkflowInput = {
  delivery_id: string;
};

const TWO_HOURS = 60 * 60 * 2;
export const handleDeliveryWorkflowId = "handle-delivery-workflow";
export const handleDeliveryWorkflow = createWorkflow(
  {
    name: handleDeliveryWorkflowId,
    store: true,
    retentionTime: TWO_HOURS,
  },
  function (input: WorkflowInput) {
    setTransactionIdStep(input.delivery_id);

    notifyRestaurantStep(input.delivery_id);

    awaitDriverClaimStep();

    const { 
      order,
      linkDef
    } = createOrderStep(input.delivery_id);

    createRemoteLinkStep(linkDef)

    awaitStartPreparationStep();

    awaitPreparationStep();

    createFulfillmentStep(order);

    awaitPickUpStep();

    awaitDeliveryStep();

    return new WorkflowResponse("Delivery completed");
  }
);
