import { createStep } from "@medusajs/framework/workflows-sdk";

export const awaitDeliveryStepId = "await-delivery-step";
export const awaitDeliveryStep = createStep(
  { name: awaitDeliveryStepId, async: true, timeout: 60 * 15 },
  async function (_, { container }) {
    const logger = container.resolve("logger");
    logger.info("Awaiting delivery by driver...");
  }
);
