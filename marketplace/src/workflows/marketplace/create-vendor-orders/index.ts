import { 
  createWorkflow,
  when,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { 
  useQueryGraphStep,
  createRemoteLinkStep,
  completeCartWorkflow,
  getOrderDetailWorkflow,
  acquireLockStep,
  releaseLockStep
} from "@medusajs/medusa/core-flows"
import groupVendorItemsStep, { GroupVendorItemsStepInput } from "./steps/group-vendor-items"
import createVendorOrdersStep from "./steps/create-vendor-orders"
import vendorOrderLink from "../../../links/vendor-order"

type WorkflowInput = {
  cart_id: string
}

const createVendorOrdersWorkflow = createWorkflow(
  "create-vendor-order",
  (input: WorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: ["id", "items.*"],
      filters: { id: input.cart_id },
      options: {
        throwIfKeyNotFound: true
      }
    })

    acquireLockStep({
      key: input.cart_id,
      timeout: 2,
      ttl: 10,
    })

    const { id: orderId } = completeCartWorkflow.runAsStep({
      input: {
        id: carts[0].id
      }
    })

    const { data: existingLinks } = useQueryGraphStep({
      entity: vendorOrderLink.entryPoint,
      fields: ["vendor.id"],
      filters: { order_id: orderId },
    }).config({ name: "retrieve-existing-links" })
      
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
          "shipping_methods.tax_lines.*",
          "shipping_methods.adjustments.*"
        ]
      }
    })

    const vendorOrders = when(
      "create-vendor-order-links",
      { existingLinks },
      (data) => data.existingLinks.length === 0
    ).then(() => {

      const { vendorsItems } = groupVendorItemsStep({
        cart: carts[0]
      } as unknown as GroupVendorItemsStepInput)
  
      const { 
        orders: vendorOrders, 
        linkDefs
      } = createVendorOrdersStep({
        parentOrder: order,
        vendorsItems
      })
  
      createRemoteLinkStep(linkDefs)

      return vendorOrders
    })

    releaseLockStep({
      key: input.cart_id,
    })

    return new WorkflowResponse({
      order,
      vendorOrders,
    })
  }
)

export default createVendorOrdersWorkflow