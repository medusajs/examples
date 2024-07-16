import { createWorkflow } from "@medusajs/workflows-sdk"
import { 
  useRemoteQueryStep,
  createRemoteLinkStep,
  completeCartWorkflow
} from "@medusajs/core-flows"
import { CartDTO } from "@medusajs/types"
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

    const order = completeCartWorkflow.runAsStep({
      input: {
        id: cart.id
      }
    })

    const { vendorsItems } = groupVendorItemsStep({
      cart
    })

    const { 
      orders: vendorOrders, 
      linkDefs
    } = createVendorOrdersStep({
      parentOrder: order,
      vendorsItems
    })

    createRemoteLinkStep(linkDefs)

    return {
      parent_order: order,
      vendor_orders: vendorOrders
    }
  }
)

export default createVendorOrdersWorkflow