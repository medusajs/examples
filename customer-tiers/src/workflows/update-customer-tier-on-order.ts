import {
  createWorkflow,
  WorkflowResponse,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import {
  useQueryGraphStep,
  createRemoteLinkStep,
  dismissRemoteLinkStep,
} from "@medusajs/medusa/core-flows"
import { Modules, OrderStatus } from "@medusajs/framework/utils"
import { validateCustomerStep } from "./steps/validate-customer"
import { determineTierStep } from "./steps/determine-tier"
import { TIER_MODULE } from "../modules/tier"

type WorkflowInput = {
  order_id: string
}

export const updateCustomerTierOnOrderWorkflow = createWorkflow(
  "update-customer-tier-on-order",
  (input: WorkflowInput) => {
    // Get order details
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: ["id", "currency_code", "total", "customer.*", "customer.tier.*"],
      filters: {
        id: input.order_id,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    const validatedCustomer = validateCustomerStep({
      customer: orders[0].customer,
    })

    // Query completed orders for the customer in the same currency
    const { data: completedOrders } = useQueryGraphStep({
      entity: "order",
      fields: ["id", "total", "currency_code"],
      filters: {
        customer_id: validatedCustomer.id,
        currency_code: orders[0].currency_code,
        status: {
          $nin: [
            OrderStatus.CANCELED,
            OrderStatus.DRAFT,
          ]
        }
      },
    }).config({ name: "completed-orders" })

    // Calculate total purchase value using transform
    const purchasedValue = transform(
      { completedOrders },
      (data) => {
        return data.completedOrders.reduce(
          (sum: number, order: any) => sum + (order.total || 0),
          0
        )
      }
    )

    // Determine appropriate tier
    const tierId = determineTierStep({
      currency_code: orders[0].currency_code as string,
      purchase_value: purchasedValue,
    })

    // Dismiss existing tier link if it exists
    // and the tier id is not the same as the tier id in the determine tier step
    when({ orders, tierId }, (data) => !!data.orders[0].customer?.tier?.id && data.tierId !== data.orders[0].customer?.tier?.id).then(
      () => {
        dismissRemoteLinkStep([
          {
            [TIER_MODULE]: { tier_id: orders[0].customer?.tier?.id as string },
            [Modules.CUSTOMER]: { customer_id: validatedCustomer.id },
          },
        ])
      }
    )

    // Create new tier link if tierId is provided
    when({ tierId, orders }, (data) => !!data.tierId && data.orders[0].customer?.tier?.id !== data.tierId).then(() => {
      createRemoteLinkStep([
        {
          [TIER_MODULE]: { tier_id: tierId },
          [Modules.CUSTOMER]: { customer_id: validatedCustomer.id },
        },
      ])
    })

    return new WorkflowResponse({
      customer_id: validatedCustomer.id,
      tier_id: tierId,
    })
  }
)

