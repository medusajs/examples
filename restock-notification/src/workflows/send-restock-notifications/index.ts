import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { getRestockedStep } from "./steps/get-restocked";
import { sendRestockNotificationStep } from "./steps/send-restock-notification";
import { deleteRestockSubscriptionStep } from "./steps/delete-restock-subscriptions";
import { getDistinctSubscriptionsStep } from "./steps/get-distinct-subscriptions";

export const sendRestockNotificationsWorkflow = createWorkflow(
  "send-restock-notifications",
  () => {
    const subscriptions = getDistinctSubscriptionsStep()

    // @ts-ignore
    const restockedSubscriptions = getRestockedStep(subscriptions)

    const { variant_ids, sales_channel_ids } = transform({
      restockedSubscriptions
    }, (data) => {
      const filters: Record<string, string[]> = {
        variant_ids: [],
        sales_channel_ids: []
      }
      data.restockedSubscriptions.map((subscription) => {
        filters.variant_ids.push(subscription.variant_id)
        filters.sales_channel_ids.push(subscription.sales_channel_id)
      })

      return filters
    })

    // @ts-ignore
    const { data: restockedSubscriptionsWithEmails } = useQueryGraphStep({
      entity: "restock_subscription",
      fields: ["*", "product_variant.*"],
      filters: {
        variant_id: variant_ids,
        sales_channel_id: sales_channel_ids
      }
    })

    // @ts-ignore
    sendRestockNotificationStep(restockedSubscriptionsWithEmails)

    // @ts-ignore
    deleteRestockSubscriptionStep(restockedSubscriptionsWithEmails)

    return new WorkflowResponse({
      subscriptions: restockedSubscriptionsWithEmails
    })
  }
)