import { 
  createWorkflow,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { 
  useRemoteQueryStep,
  createRemoteLinkStep,
  completeCartWorkflow,
  getOrderDetailWorkflow
} from "@medusajs/medusa/core-flows"
import { CartDTO } from "@medusajs/framework/types"
import groupVendorItemsStep from "./steps/group-vendor-items"
import createVendorOrdersStep from "./steps/create-vendor-orders"

type WorkflowInput = {
  cart_id: string
}

const createVendorOrdersWorkflow = createWorkflow(
  "create-vendor-order",
  (input: WorkflowInput) => {
    const cart = useRemoteQueryStep({
      entry_point: "cart",
      fields: ['items.*'],
      variables: { id: input.cart_id },
      list: false,
      throw_if_key_not_found: true,
    }) as CartDTO

    const orderId = completeCartWorkflow.runAsStep({
      input: {
        id: cart.id
      }
    })

    const { vendorsItems } = groupVendorItemsStep({
      cart
    })
    
    const order = getOrderDetailWorkflow.runAsStep({
      input: {
        order_id: orderId.id,
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