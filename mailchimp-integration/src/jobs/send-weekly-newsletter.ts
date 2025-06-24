import {
  MedusaContainer
} from "@medusajs/framework/types";
import { sendNewProductsNewsletter } from "../workflows/send-newsletter";

export default async function myCustomJob(container: MedusaContainer) {
  const logger = container.resolve("logger")

  logger.info("Sending weekly newsletter...")

  await sendNewProductsNewsletter(container)
    .run({
      input: {}
    })

  logger.info("Newsletter sent successfully")
}

export const config = {
  name: "send-weekly-newsletter",
  schedule: "0 0 * * 0", // Every Sunday at midnight
  // schedule: "* * * * *", // Every minute for testing
};