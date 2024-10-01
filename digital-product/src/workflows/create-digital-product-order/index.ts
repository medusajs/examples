import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import {
  completeCartWorkflow,
  useRemoteQueryStep,
  createRemoteLinkStep,
  createOrderFulfillmentWorkflow,
  emitEventStep
} from "@medusajs/medusa/core-flows"
import {
  Modules
} from "@medusajs/framework/utils"
import createDigitalProductOrderStep from "./steps/create-digital-product-order"
import { DIGITAL_PRODUCT_MODULE } from "../../modules/digital-product"

type WorkflowInput = {
  cart_id: string
}

const createDigitalProductOrderWorkflow = createWorkflow(
  "create-digital-product-order",
  (input: WorkflowInput) => {
    const order = completeCartWorkflow.runAsStep({
      input: {
        id: input.cart_id
      }
    })

    const { items } = useRemoteQueryStep({
      entry_point: "order",
      fields: [
        "*",
        "items.*",
        "items.variant.*",
        "items.variant.digital_product.*"
      ],
      variables: {
        filters: {
          id: order.id
        }
      },
      throw_if_key_not_found: true,
      list: false
    })

    const itemsWithDigitalProducts = transform({
      items
    },
    (data) => {
      return data.items.filter((item) => item.variant.digital_product !== undefined)
    }
    )

    const digital_product_order = when(itemsWithDigitalProducts, (itemsWithDigitalProducts) => {
      return itemsWithDigitalProducts.length
    })
    .then(() => {
      const { 
        digital_product_order,
      } = createDigitalProductOrderStep({ items })
  
      createRemoteLinkStep([{
        [DIGITAL_PRODUCT_MODULE]: {
          digital_product_order_id: digital_product_order.id
        },
        [Modules.ORDER]: {
          order_id: order.id
        }
      }])

      createOrderFulfillmentWorkflow.runAsStep({
        input: {
          order_id: order.id,
          items: transform({
            itemsWithDigitalProducts
          }, (data) => {
            return data.itemsWithDigitalProducts.map((item) => ({
              id: item.id,
              quantity: item.quantity
            }))
          })
        }
      })
  
      emitEventStep({
        eventName: "digital_product_order.created",
        data: {
          id: digital_product_order.id
        }
      })

      return digital_product_order
    })

    return new WorkflowResponse({
      order,
      digital_product_order
    })
  }
)

export default createDigitalProductOrderWorkflow