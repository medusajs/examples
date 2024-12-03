import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { validateVariantOutOfStockStep } from "./steps/validate-variant-out-of-stock"
import { getEmailStep } from "./steps/get-email"
import { createOrGetRestockSubscriptionsStep } from "./steps/create-or-get-restock-subscriptions"
import { addRestockSubscriberStep } from "./steps/add-restock-subscribers"

type CreateRestockSubscriptionWorkflowInput = {
  variant_id: string
  sales_channel_ids: string[]
  customer: {
    email?: string
    customer_id?: string
  }
}

export const createRestockSubscriptionWorkflow = createWorkflow(
  "create-restock-subscription",
  (input: CreateRestockSubscriptionWorkflowInput) => {
    const email = getEmailStep(input.customer)
    
    validateVariantOutOfStockStep({
      variant_id: input.variant_id,
      sales_channel_ids: input.sales_channel_ids
    })

    const restockSubscriptions = createOrGetRestockSubscriptionsStep({
      variant_id: input.variant_id,
      sales_channel_ids: input.sales_channel_ids
    })

    const restockSubscriptionIds = transform({
      restockSubscriptions
    }, (data) => {
      return data.restockSubscriptions.map((restockSubscription) => restockSubscription.id)
    })

    const restockSubscriber = addRestockSubscriberStep({
      email,
      customer_id: input.customer.customer_id,
      restock_subscription_ids: restockSubscriptionIds
    })

    return new WorkflowResponse({
      restockSubscriptions,
      restockSubscriber
    })
  }
)