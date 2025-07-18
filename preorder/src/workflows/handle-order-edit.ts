import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { emitEventStep, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { RetrievePreorderUpdatesStep, retrievePreorderUpdatesStep } from "./steps/retrieve-preorder-updates"
import { updatePreordersStep } from "./steps/update-preorders"
import { createPreordersStep } from "./steps/create-preorders"

type WorkflowInput = {
  order_id: string
}

export const handleOrderEditWorkflow = createWorkflow(
  "handle-order-edit",
  (input: WorkflowInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "*",
        "items",
        "items.variant.*",
        "items.variant.preorder_variant.*",
      ],
      filters: {
        id: input.order_id,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    const { data: preorders } = useQueryGraphStep({
      entity: "preorder",
      fields: ["*", "item.*"],
      filters: {
        order_id: input.order_id,
        status: "pending",
      },
    }).config({ name: "retrieve-preorders" })

    const { preordersToCancel, preordersToCreate } = retrievePreorderUpdatesStep({
      order: orders[0],
      preorders,
    } as unknown as RetrievePreorderUpdatesStep)

    updatePreordersStep(preordersToCancel)
    
    createPreordersStep(preordersToCreate)

    const preordersCancelledEvent = transform({
      preordersToCancel,
      input
    }, (data) => {
      return data.preordersToCancel.map((preorder) => ({
        id: preorder.id,
        order_id: data.input.order_id,
      }))
    })

    emitEventStep({
      eventName: "preorder.cancelled",
      data: preordersCancelledEvent,
    })

    return new WorkflowResponse({
      createdPreorders: preordersToCreate,
      cancelledPreorders: preordersToCancel,
    })
  }
)