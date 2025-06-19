import {
  MedusaContainer
} from "@medusajs/framework/types";
import { MedusaError } from "@medusajs/framework/utils";

export default async function testSentry(container: MedusaContainer) {
  throw new MedusaError(
    MedusaError.Types.UNEXPECTED_STATE,
    "This is a test error for Sentry integration. If you see this, Sentry is working correctly."
  )
}

export const config = {
  name: "test-sentry",
  schedule: "0 0 * * *", // Every minute
};