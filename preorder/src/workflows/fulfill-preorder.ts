import { InferTypeOf } from "@medusajs/framework/types"
import { PreorderVariant } from "../modules/preorder/models/preorder-variant"
import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { capturePaymentWorkflow, createOrderFulfillmentWorkflow, emitEventStep, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { retrieveItemsToFulfillStep, RetrieveItemsToFulfillStepInput } from "./steps/retrieve-items-to-fulfill"
import { updatePreordersStep } from "./steps/update-preorders"
import { PreorderStatus } from "../modules/preorder/models/preorder"

type WorkflowInput = {
  preorder_id: string
  item: InferTypeOf<typeof PreorderVariant>
  order_id: string
}

export const fulfillPreorderWorkflow = createWorkflow(
  "fulfill-preorder",
  (input: WorkflowInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "items.*", 
        // UNCOMMENT TO CAPTURE PAYMENTS
        // "payment_collections.*", 
        // "payment_collections.payments.*", 
        // "total", 
        // "shipping_methods.*"
      ],
      filters: {
        id: input.order_id,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    const { 
      items_to_fulfill, 
      items_total
    } = retrieveItemsToFulfillStep({
      preorder_variant: input.item,
      line_items: orders[0].items,
    } as unknown as RetrieveItemsToFulfillStepInput)

    const fulfillment = createOrderFulfillmentWorkflow.runAsStep({
      input: {
        order_id: input.order_id,
        items: items_to_fulfill,
      }
    })

    updatePreordersStep([{
      id: input.preorder_id,
      status: PreorderStatus.FULFILLED,
    }])

    // UNCOMMENT TO CAPTURE PAYMENTS
    // const totalCaptureAmount = transform({
    //   items_total,
    //   shipping_option_id: fulfillment.shipping_option_id,
    //   shipping_methods: orders[0].shipping_methods
    // }, (data) => {
    //   const shippingPrice = data.shipping_methods?.find(
    //     (sm) => sm?.shipping_option_id === data.shipping_option_id
    //   )?.amount || 0
    //   return data.items_total + shippingPrice
    // })

    // when({
    //   payment_collection: orders[0].payment_collections?.[0],
    //   capture_total: totalCaptureAmount
    // }, (data) => {
    //   return data.payment_collection?.amount !== undefined && data.payment_collection.captured_amount !== null &&  
    //     (data.payment_collection.amount - data.payment_collection.captured_amount >= data.capture_total)
    // }).then(() => {
    //   capturePaymentWorkflow.runAsStep({
    //     input: {
    //       // @ts-ignore
    //       payment_id: orders[0].payment_collections?.[0]?.payments[0].id,
    //       amount: totalCaptureAmount,
    //     }
    //   })
    // })

    emitEventStep({
      eventName: "preorder.fulfilled",
      data: {
        order_id: input.order_id,
        preorder_variant_id: input.item.id,
      },
    })

    return new WorkflowResponse({
      fulfillment
    })
  }
)