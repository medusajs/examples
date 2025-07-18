import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { InferTypeOf } from "@medusajs/framework/types"
import { cancelPreordersWorkflow, CancelPreordersWorkflowInput } from "../workflows/cancel-preorders"
import { Preorder } from "../modules/preorder/models/preorder"

export default async function orderCanceledHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  id: string
}>) {
  const query = container.resolve("query")

  const workflowInput: CancelPreordersWorkflowInput = {
    preorders: [],
    order_id: data.id
  }
  const limit = 1000
  let offset = 0
  let count = 0

  do {
    const { 
      data: preorders,
      metadata
    } = await query.graph({
      entity: "preorder",
      fields: ["*"],
      filters: {
        order_id: data.id,
        status: "pending",
      },
      pagination: {
        take: limit,
        skip: offset
      }
    })
    offset += limit
    count = metadata?.count || 0

    workflowInput.preorders.push(
      ...preorders as InferTypeOf<typeof Preorder>[]
    )
  } while (count > offset + limit)
    
  await cancelPreordersWorkflow(container).run({
    input: workflowInput,
  })
}

export const config: SubscriberConfig = {
  event: "order.canceled",
}