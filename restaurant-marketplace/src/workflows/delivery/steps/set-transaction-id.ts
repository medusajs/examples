import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk";
import { DELIVERY_MODULE } from "../../../modules/delivery";
import DeliveryModuleService from "../../../modules/delivery/service";

export type SetTransactionIdStepInput = {
  delivery_id: string;
};

export const setTransactionIdStep = createStep(
  "create-delivery-step",
  async function (deliveryId: string, { container, context }) {
    const deliverModuleService: DeliveryModuleService = 
      container.resolve(DELIVERY_MODULE);

    const delivery = await deliverModuleService.updateDeliveries({
      id: deliveryId,
      transaction_id: context.transactionId,
    });

    return new StepResponse(delivery, delivery.id);
  },
  async function (delivery_id: string, { container }) {
    const deliverModuleService: DeliveryModuleService = 
      container.resolve(DELIVERY_MODULE);

    await deliverModuleService.updateDeliveries({
      id: delivery_id,
      transaction_id: null,
    });
  }
);
