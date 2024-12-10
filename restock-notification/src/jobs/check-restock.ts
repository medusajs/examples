import {
  MedusaContainer
} from "@medusajs/framework/types";
import { sendRestockNotificationsWorkflow } from "../workflows/send-restock-notifications";

export default async function myCustomJob(container: MedusaContainer) {
  await sendRestockNotificationsWorkflow(container)
    .run()
}

export const config = {
  name: "check-restock",
  schedule: "0 0 * * *", // For debugging, change to `* * * * *`
};