import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { validateVariantOutOfStockStep } from "./steps/validate-variant-out-of-stock"
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
    const customerId = transform({
      customer
    }, (data) => {
      return data.customer.customer_id || ""
    })
    const retrievedCustomer = when("retrieve-customer-by-id", { customer }, ({ customer }) => {
      return !customer.email
    }).then(() => {
      // @ts-ignore
      const { data } = useQueryGraphStep({
        entity: "customer",
        fields: ["email"],
        filters: { id: customerId },
        options: {
          throwIfKeyNotFound: true
        }
      }).config({ name: "retrieve-customer" })

      return data
    })
    
    const email = transform({ 
      retrievedCustomer, 
      customer
    }, (data) => {
      return data.customer?.email ?? data.retrievedCustomer?.[0].email
    })
    
    validateVariantOutOfStockStep({
      variant_id,
      sales_channel_id
    })

    // @ts-ignore
    const { data: restockSubscriptions } = useQueryGraphStep({
      entity: "restock_subscription",
      fields: ["*"],
      filters: {
        email,
        variant_id,
        sales_channel_id
      }
    }).config({ name: "retrieve-subscriptions" })

    when({ restockSubscriptions }, ({ restockSubscriptions }) => {
      return restockSubscriptions.length === 0
    })
    .then(() => {
      createRestockSubscriptionStep({
        variant_id,
        sales_channel_id,
        email,
        customer_id: customer.customer_id
      })
    })

    when({ restockSubscriptions }, ({ restockSubscriptions }) => {
      return restockSubscriptions.length > 0
    })
    .then(() => {
      updateRestockSubscriptionStep({
        id: restockSubscriptions[0].id,
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