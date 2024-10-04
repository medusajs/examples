import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import { DeliveryStatus } from "../../../../modules/delivery/types";
import { notifyRestaurantStepId } from "../../../../workflows/delivery/steps/notify-restaurant";
import { updateDeliveryWorkflow } from "../../../../workflows/delivery/workflows/update-delivery";

const DEFAULT_PROCESSING_TIME = 30 * 60 * 1000; // 30 minutes

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;

  const eta = new Date(new Date().getTime() + DEFAULT_PROCESSING_TIME);

  const data = {
    id,
    delivery_status: DeliveryStatus.RESTAURANT_ACCEPTED,
    eta,
  };

  const updatedDeliveryResult = await updateDeliveryWorkflow(req.scope)
    .run({
      input: {
        data,
        stepIdToSucceed: notifyRestaurantStepId,
      },
    })
    .catch((error) => {
      console.log(error);
      return MedusaError.Types.UNEXPECTED_STATE;
    });

  if (typeof updatedDeliveryResult === "string") {
    throw new MedusaError(updatedDeliveryResult, "An error occurred")
  }

  return res.status(200).json({ delivery: updatedDeliveryResult.result });
}
