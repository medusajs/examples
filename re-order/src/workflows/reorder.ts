import { 
  createWorkflow, 
  transform, 
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { 
  addShippingMethodToCartWorkflow, 
  createCartWorkflow, 
  useQueryGraphStep
} from "@medusajs/medusa/core-flows";

type ReorderWorkflowInput = {
  order_id: string
}

export const reorderWorkflow = createWorkflow(
  "reorder",
  ({ order_id }: ReorderWorkflowInput) => {
    // @ts-ignore
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "*",
        "items.*",
        "shipping_address.*",
        "billing_address.*",
        "region.*",
        "sales_channel.*",
        "shipping_methods.*",
        "customer.*",
      ],
      filters: {
        id: order_id,
      },
    })

    const createInput = transform({
      orders
    }, (data) => {
      return {
        region_id: data.orders[0].region_id!,
        sales_channel_id: data.orders[0].sales_channel_id!,
        customer_id: data.orders[0].customer_id!,
        email: data.orders[0].email!,
        billing_address: {
          first_name: data.orders[0].billing_address?.first_name!,
          last_name: data.orders[0].billing_address?.last_name!,
          address_1: data.orders[0].billing_address?.address_1!,
          city: data.orders[0].billing_address?.city!,
          country_code: data.orders[0].billing_address?.country_code!,
          province: data.orders[0].billing_address?.province!,
          postal_code: data.orders[0].billing_address?.postal_code!,
          phone: data.orders[0].billing_address?.phone!,
        },
        shipping_address: {
          first_name: data.orders[0].shipping_address?.first_name!,
          last_name: data.orders[0].shipping_address?.last_name!,
          address_1: data.orders[0].shipping_address?.address_1!,
          city: data.orders[0].shipping_address?.city!,
          country_code: data.orders[0].shipping_address?.country_code!,
          province: data.orders[0].shipping_address?.province!,
          postal_code: data.orders[0].shipping_address?.postal_code!,
          phone: data.orders[0].shipping_address?.phone!,
        },
        items: data.orders[0].items?.map((item) => ({
          variant_id: item?.variant_id!,
          quantity: item?.quantity!,
          unit_price: item?.unit_price!,
        })),
      }
    })
    
    const { id: cart_id } = createCartWorkflow.runAsStep({
      input: createInput,
    })

    const addShippingMethodToCartInput = transform({
      cart_id,
      orders
    }, (data) => {
      return {
        cart_id: data.cart_id,
        options: data.orders[0].shipping_methods?.map((method) => ({
          id: method?.shipping_option_id!,
          data: method?.data!,
        })) ?? [],
      }
    })

    addShippingMethodToCartWorkflow.runAsStep({
      input: addShippingMethodToCartInput,
    })

    // @ts-ignore
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: [
        "*",
        "items.*",
        "shipping_methods.*",
        "shipping_address.*",
        "billing_address.*",
        "region.*",
        "sales_channel.*",
        "promotions.*",
        "currency_code",
        "subtotal",
        "item_total",
        "total",
        "item_subtotal",
        "shipping_subtotal",
        "customer.*",
        "payment_collection.*"
        
      ],
      filters: {
        id: cart_id,
      },
    }).config({ name: "retrieve-cart" })

    return new WorkflowResponse(carts[0])
  }
)