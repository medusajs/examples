import { createWorkflow, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { completeCartWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { retrievePreorderItemIdsStep, RetrievePreorderItemIdsStepInput } from "./steps/retrieve-preorder-items"
import { createPreordersStep } from "./steps/create-preorders"

type WorkflowInput = {
  cart_id: string
}

export const completeCartPreorderWorkflow = createWorkflow(
  "complete-cart-preorder",
  (input: WorkflowInput) => {
    const { id } = completeCartWorkflow.runAsStep({
      input: {
        id: input.cart_id,
      }
    })

    const { data: line_items } = useQueryGraphStep({
      entity: "line_item",
      fields: [
        "variant.*",
        "variant.preorder_variant.*"
      ],
      filters: {
        cart_id: input.cart_id,
      }
    })

    const preorderItemIds = retrievePreorderItemIdsStep({
      line_items
    } as unknown as RetrievePreorderItemIdsStepInput)

    when({
      preorderItemIds
    }, (data) => data.preorderItemIds.length > 0)
    .then(() => {
      createPreordersStep({
        preorder_variant_ids: preorderItemIds,
        order_id: id
      })
    })

    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "*",
        "items.*",
        "items.variant.*",
        "items.variant.preorder_variant.*",
        "shipping_address.*",
        "billing_address.*",
        "payment_collections.*",
        "shipping_methods.*",
      ],
      filters: {
        id,
      }
    }).config({ name: "retrieve-order" })

    return new WorkflowResponse({
      order: orders[0],
      
    })
  }
)