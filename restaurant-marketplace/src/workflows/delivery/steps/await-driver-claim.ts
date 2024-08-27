import { createStep } from "@medusajs/workflows-sdk";

export const awaitDriverClaimStepId = "await-driver-claim-step";
export const awaitDriverClaimStep = createStep(
  { 
    name: awaitDriverClaimStepId, 
    async: true, 
    timeout: 60 * 15, 
    maxRetries: 2
  },
  async function (_, { container }) {
    const logger = container.resolve("logger");
    logger.info("Awaiting driver to claim...");
  }
);
