import { createStep } from "@medusajs/framework/workflows-sdk";

export const awaitPickUpStepId = "await-pick-up-step";
export const awaitPickUpStep = createStep(
  { name: awaitPickUpStepId, async: true, timeout: 60 * 15 },
  async function (_, { container }) {
    const logger = container.resolve("logger");
    logger.info("Awaiting pick up by driver...");
  }
);
