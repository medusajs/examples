import { createWorkflow, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { validateVariantOutOfStockStep } from "./steps/validate-variant-out-of-stock"
import { getEmailStep } from "./steps/get-email"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createRestockSubscriptionStep } from "./steps/create-restock-subscription"
import { updateRestockSubscriptionStep } from "./steps/update-restock-subscription"

type CreateRestockSubscriptionWorkflowInput = {
  variant_id: string
  sales_channel_id: string
  customer: {
    email?: string
    customer_id?: string
  }
}

export const createRestockSubscriptionWorkflow = createWorkflow(
  "create-restock-subscription",
  ({
    variant_id,
    sales_channel_id,
    customer
  }: CreateRestockSubscriptionWorkflowInput) => {
    const email = getEmailStep(customer)
    
    validateVariantOutOfStockStep({
      variant_id,
      sales_channel_id
    })

    const { data } = useQueryGraphStep({
      entity: "restock_subscription",
      fields: ["*"],
      filters: {
        email,
        variant_id,
        sales_channel_id
      }
    })

    when({ data }, ({ data }) => {
      return data.length === 0
    })
    .then(() => {
      createRestockSubscriptionStep({
        variant_id,
        sales_channel_id,
        email,
        customer_id: customer.customer_id
      })
    })

    when({ data }, ({ data }) => {
      return data.length > 0
    })
    .then(() => {
      updateRestockSubscriptionStep({
        id: data[0].id,
        customer_id: customer.customer_id
      })
    })

    // @ts-ignore
    const { data: restockSubscription } = useQueryGraphStep({
      entity: "restock_subscription",
      fields: ["*"],
      filters: {
        email,
        variant_id,
        sales_channel_id
      }
    }).config({ name: "retrieve-restock-subscription" })

    return new WorkflowResponse(
      restockSubscription
    )
  }
)