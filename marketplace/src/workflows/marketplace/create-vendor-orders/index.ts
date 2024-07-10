import { createWorkflow, transform } from "@medusajs/workflows-sdk"
import { OrderDTO } from "@medusajs/types"
import retrieveCartStep from "./steps/retrieve-cart"
import groupVendorItemsStep from "./steps/group-vendor-items"
import createParentOrderStep from "./steps/create-parent-order"
import createVendorOrdersStep, { VendorOrder } from "./steps/create-vendor-orders"

type WorkflowInput = {
  cart_id: string
}

type WorkflowOutput = {
  parent_order: OrderDTO
  vendor_orders: VendorOrder[]
}

const createVendorOrdersWorkflow = createWorkflow<
  WorkflowInput, WorkflowOutput
>(
  "create-vendor-order",
  (input) => {
    const { cart } = retrieveCartStep(input)

    const { order } = createParentOrderStep(input)

    const { vendorsItems } = groupVendorItemsStep(
      transform({
        cart
      },
      (data) => data
      )
    )

    const { orders } = createVendorOrdersStep(
      transform({
        order,
        vendorsItems
      },
      (data) => {
        return {
          parentOrder: data.order,
          vendorsItems: data.vendorsItems
        }
      }
      )
    )

    return transform({
      order,
      orders
    },
    (data) => ({
      parent_order: data.order,
      vendor_orders: data.orders
    })
    )
  }
)

export default createVendorOrdersWorkflow