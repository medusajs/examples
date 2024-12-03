import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { getRestockedStep } from "./steps/get-restocked";
import { sendRestockNotificationStep } from "./steps/send-restock-notification";
import { deleteRestockSubscriptionStep } from "./steps/delete-restock-subscriptions";

export const sendRestockNotificationsWorkflow = createWorkflow(
  "send-restock-notifications",
  () => {
    // @ts-ignore
    const { data: restockSubscriptions } = useQueryGraphStep({
      entity: "restock_subscription",
      fields: ["*", "product_variant.*"],
    })

    // @ts-ignore
    const restocked = getRestockedStep(restockSubscriptions)

    sendRestockNotificationStep(restocked)

    deleteRestockSubscriptionStep(restocked)

    return new WorkflowResponse({
      restocked
    })
  }
)