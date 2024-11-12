import { 
  createWorkflow,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { 
  useQueryGraphStep,
  createRemoteLinkStep,
  completeCartWorkflow,
  getOrderDetailWorkflow
} from "@medusajs/medusa/core-flows"
import groupVendorItemsStep from "./steps/group-vendor-items"
import createVendorOrdersStep from "./steps/create-vendor-orders"

type WorkflowInput = {
  cart_id: string
}

const createVendorOrdersWorkflow = createWorkflow(
  "create-vendor-order",
  (input: WorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: ['items.*'],
      filters: { id: input.cart_id },
      options: {
        throwIfKeyNotFound: true
      }
    })

    const { id: orderId } = completeCartWorkflow.runAsStep({
      input: {
        id: carts[0].id
      }
    })

    const { vendorsItems } = groupVendorItemsStep({
      cart: carts[0].id
    })
    
    const order = getOrderDetailWorkflow.runAsStep({
      input: {
        order_id: orderId,
        fields: [
          "region_id",
          "customer_id",
          "sales_channel_id",
          "email",
          "currency_code",
          "shipping_address.*",
          "billing_address.*",
          "shipping_methods.*",
        ]
      }
    })

    const { 
      orders: vendorOrders, 
      linkDefs
    } = createVendorOrdersStep({
      parentOrder: order,
      vendorsItems
    })

    createRemoteLinkStep(linkDefs)

    return new WorkflowResponse({
      parent_order: order,
      vendor_orders: vendorOrders
    })
  }
)

export default createVendorOrdersWorkflow