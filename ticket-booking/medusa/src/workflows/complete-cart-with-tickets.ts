import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { completeCartWorkflow, createRemoteLinkStep, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createTicketPurchasesStep, CreateTicketPurchasesStepInput } from "./steps/create-ticket-purchases"
import { TICKET_BOOKING_MODULE } from "../modules/ticket-booking"
import { Modules } from "@medusajs/framework/utils"

export type CompleteCartWithTicketsWorkflowInput = {
  cart_id: string
}

export const completeCartWithTicketsWorkflow = createWorkflow(
  "complete-cart-with-tickets",
  (input: CompleteCartWithTicketsWorkflowInput) => {
    // Step 1: Complete the cart using Medusa's workflow
    const order = completeCartWorkflow.runAsStep({
      input: {
        id: input.cart_id
      }
    })

    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: [
        "id", 
        "items.variant.*",
        "items.variant.options.*",
        "items.variant.options.option.*",
        "items.variant.ticket_product_variant.*",
        "items.variant.ticket_product_variant.ticket_product.*",
        "items.metadata"
      ],
      filters: {
        id: input.cart_id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    // Step 2: Create ticket purchases for ticket products
    const ticketPurchases = createTicketPurchasesStep({
      order_id: order.id,
      cart: carts[0]
    } as unknown as CreateTicketPurchasesStepInput)

    // Step 3: Link ticket purchases to the order
    const linkData = transform({
      order,
      ticketPurchases
    }, (data) => {
      return data.ticketPurchases.map((purchase) => ({
        [TICKET_BOOKING_MODULE]: {
          ticket_purchase_id: purchase.id
        },
        [Modules.ORDER]: {
          order_id: data.order.id
        }
      }))
    })

    // Step 4: Create remote links
    createRemoteLinkStep(linkData)

    // Step 5: Fetch order details
    const { data: refetchedOrder } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "currency_code",
        "email",
        "customer.*",
        "billing_address.*",
        "payment_collections.*",
        "items.*",
        "total",
        "subtotal",
        "tax_total",
        "shipping_total",
        "discount_total",
        "created_at",
        "updated_at"
      ],
      filters: {
        id: order.id
      }
    }).config({ name: "refetch-order" })

    return new WorkflowResponse({
      order: refetchedOrder[0],
    })
  }
)

