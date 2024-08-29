import { createStep } from "@medusajs/workflows-sdk";

export const awaitPreparationStepId = "await-preparation-step";
export const awaitPreparationStep = createStep(
  { name: awaitPreparationStepId, async: true, timeout: 60 * 15 },
  async function (_, { container }) {
    const logger = container.resolve("logger");
    logger.info("Awaiting preparation...");
  }
);
