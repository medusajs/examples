import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { 
  completeCartWorkflow, 
  createRemoteLinkStep, 
  acquireLockStep, 
  releaseLockStep, 
  useQueryGraphStep
} from "@medusajs/medusa/core-flows"
import { createTicketPurchasesStep, CreateTicketPurchasesStepInput } from "./steps/create-ticket-purchases"
import { TICKET_BOOKING_MODULE } from "../modules/ticket-booking"
import { Modules } from "@medusajs/framework/utils"
import ticketPurchaseOrderLink from "../links/ticket-purchase-order"
import { validateTicketOrderStep, ValidateTicketOrderStepInput } from "./steps/validate-ticket-order"

export type CompleteCartWithTicketsWorkflowInput = {
  cart_id: string
}

export const completeCartWithTicketsWorkflow = createWorkflow(
  "complete-cart-with-tickets",
  (input: CompleteCartWithTicketsWorkflowInput) => {
    acquireLockStep({
      key: input.cart_id,
      timeout: 2,
      ttl: 10,
    })
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
        "items.variant.ticket_product_variant.purchases.*",
        "items.metadata",
        "items.quantity"
      ],
      filters: {
        id: input.cart_id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    const { data: existingLinks } = useQueryGraphStep({
      entity: ticketPurchaseOrderLink.entryPoint,
      fields: ["ticket_purchase.id"],
      filters: { order_id: order.id },
    }).config({ name: "retrieve-existing-links" })

    when({ existingLinks }, (data) => data.existingLinks.length === 0)
    .then(() => {
      validateTicketOrderStep({
        items: carts[0].items,
        order_id: order.id
      } as unknown as ValidateTicketOrderStepInput)
      const ticketPurchases = createTicketPurchasesStep({
        order_id: order.id,
        cart: carts[0]
      } as unknown as CreateTicketPurchasesStepInput)
  
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
  
      createRemoteLinkStep(linkData)
    })

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

    releaseLockStep({
      key: input.cart_id,
    })

    return new WorkflowResponse({
      order: refetchedOrder[0],
    })
  }
)

