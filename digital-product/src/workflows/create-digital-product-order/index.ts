import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import {
  completeCartWorkflow,
  useQueryGraphStep,
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
    const { id } = completeCartWorkflow.runAsStep({
      input: {
        id: input.cart_id
      }
    })

    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "*",
        "items.*",
        "items.variant.*",
        "items.variant.digital_product.*"
      ],
      filters: {
        id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    const itemsWithDigitalProducts = transform({
      orders
    },
    (data) => {
      return data.orders[0].items.filter((item) => item.variant.digital_product !== undefined)
    }
    )

    const digital_product_order = when(itemsWithDigitalProducts, (itemsWithDigitalProducts) => {
      return itemsWithDigitalProducts.length
    })
    .then(() => {
      const { 
        digital_product_order,
      } = createDigitalProductOrderStep({
        items: orders[0].items
      })
  
      createRemoteLinkStep([{
        [DIGITAL_PRODUCT_MODULE]: {
          digital_product_order_id: digital_product_order.id
        },
        [Modules.ORDER]: {
          order_id: id
        }
      }])

      createOrderFulfillmentWorkflow.runAsStep({
        input: {
          order_id: id,
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
      order: orders[0],
      digital_product_order
    })
  }
)

export default createDigitalProductOrderWorkflow