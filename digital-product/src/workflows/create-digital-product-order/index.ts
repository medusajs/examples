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
  emitEventStep,
  acquireLockStep,
  releaseLockStep
} from "@medusajs/medusa/core-flows"
import {
  Modules
} from "@medusajs/framework/utils"
import createDigitalProductOrderStep, { 
  CreateDigitalProductOrderStepInput
} from "./steps/create-digital-product-order"
import { DIGITAL_PRODUCT_MODULE } from "../../modules/digital-product"
import digitalProductOrderOrderLink from "../../links/digital-product-order";

type WorkflowInput = {
  cart_id: string
}

const createDigitalProductOrderWorkflow = createWorkflow(
  "create-digital-product-order",
  (input: WorkflowInput) => {
    acquireLockStep({
      key: input.cart_id,
      timeout: 30,
      ttl: 120,
    });
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
        "items.variant.digital_product.*",
        "shipping_address.*",
      ],
      filters: {
        id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    const { data: existingLinks } = useQueryGraphStep({
      entity: digitalProductOrderOrderLink.entryPoint,
      fields: ["digital_product_order.id"],
      filters: { order_id: id },
    }).config({ name: "retrieve-existing-links" });

    const itemsWithDigitalProducts = transform(
      {
        orders,
      },
      (data) => {
        return data.orders[0].items?.filter(
          (item) => item?.variant?.digital_product !== undefined
        );
      }
    );

    const digital_product_order = when(
      "create-digital-product-order-condition",
      { itemsWithDigitalProducts, existingLinks },
      (data) => {
        return (
          !!data.itemsWithDigitalProducts?.length &&
          data.existingLinks.length === 0
        );
      }
    )
    .then(() => {
      const { 
        digital_product_order,
      } = createDigitalProductOrderStep({
        items: orders[0].items
      } as unknown as CreateDigitalProductOrderStepInput)
  
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
            return data.itemsWithDigitalProducts!.map((item) => ({
              id: item!.id,
              quantity: item!.quantity
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

    releaseLockStep({
      key: input.cart_id,
    })

    return new WorkflowResponse({
      order: orders[0],
      digital_product_order
    })
  }
)

export default createDigitalProductOrderWorkflow