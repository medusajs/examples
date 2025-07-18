import { InferTypeOf } from "@medusajs/framework/types"
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { updatePreordersStep } from "./steps/update-preorders"
import { Preorder, PreorderStatus } from "../modules/preorder/models/preorder"

export type CancelPreordersWorkflowInput = {
  preorders: InferTypeOf<typeof Preorder>[]
  order_id: string
}

export const cancelPreordersWorkflow = createWorkflow(
  "cancel-preorders",
  (input: CancelPreordersWorkflowInput) => {
    const updateData = transform({
      preorders: input.preorders,
    }, (data) => {
      return data.preorders.map((preorder) => ({
        id: preorder.id,
        status: PreorderStatus.CANCELLED,
      }))
    })

    const updatedPreorders = updatePreordersStep(updateData)

    const preordersCancelledEvent = transform({
      preorders: updatedPreorders,
      input
    }, (data) => {
      return data.preorders.map((preorder) => ({
        id: preorder.id,
        order_id: data.input.order_id,
      }))
    })

    emitEventStep({
      eventName: "preorder.cancelled",
      data: preordersCancelledEvent,
    })

    return new WorkflowResponse({
      preorders: updatedPreorders
    })
  }
)