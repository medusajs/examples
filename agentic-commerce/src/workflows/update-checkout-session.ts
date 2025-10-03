import { 
  createWorkflow, 
  transform, 
  when, 
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { 
  addShippingMethodToCartWorkflow, 
  createCustomersWorkflow, 
  updateCartWorkflow, 
  useQueryGraphStep
} from "@medusajs/medusa/core-flows"
import { prepareCheckoutSessionDataWorkflow } from "./prepare-checkout-session-data"

type WorkflowInput = {
  cart_id: string
  buyer?: {
    first_name: string
    email: string
    phone_number?: string
  }
  items?: {
    id: string
    quantity: number
  }[]
  fulfillment_address?: {
    name: string
    line_one: string
    line_two?: string
    city: string
    state: string
    postal_code: string
    phone_number?: string
    country: string
  }
  fulfillment_option_id?: string
}

export const updateCheckoutSessionWorkflow = createWorkflow(
  "update-checkout-session",
  (input: WorkflowInput) => {
    // Retrieve cart
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: ["id", "customer.*", "email"],
      filters: {
        id: input.cart_id,
      }
    })

    // check if customer already exists
    const { data: customers } = useQueryGraphStep({
      entity: "customer",
      fields: ["id"],
      filters: {
        email: input.buyer?.email,
      }
    }).config({ name: "find-customer" })

    const createdCustomers = when({ customers }, ({ customers }) => customers.length === 0 && !!input.buyer?.email)
    .then(() => {
      return createCustomersWorkflow.runAsStep({
        input: {
          customersData: [
            {
              email: input.buyer?.email,
              first_name: input.buyer?.first_name,
              phone: input.buyer?.phone_number,
            }
          ],
        }
      })
    })

    const customerId = transform({
      customers,
      createdCustomers,
    }, (data) => {
      return data.customers.length > 0 ? data.customers[0].id : data.createdCustomers?.[0].id
    })

    // validate items
    when(input, (input) => !!input.items)
    .then(() => {
      const variantIds = transform(input, (input) => input.items?.map((item) => item.id))
      return useQueryGraphStep({
        entity: "variant",
        fields: ["id"],
        filters: {
          id: variantIds,
        },
        options: {
          throwIfKeyNotFound: true,
        }
      }).config({ name: "find-variant" })
    })

    // Prepare update data
    const updateData = transform({
      input,
      carts,
      customerId,
    }, (data) => {
      return {
        id: data.carts[0].id,
        email: data.input.buyer?.email || data.carts[0].email,
        customer_id: data.customerId || data.carts[0].customer?.id,
        items: data.input.items?.map((item) => ({
          variant_id: item.id,
          quantity: item.quantity,
        })),
        shipping_address: data.input.fulfillment_address ? {
          first_name: data.input.fulfillment_address.name.split(" ")[0],
          last_name: data.input.fulfillment_address.name.split(" ")[1],
          address_1: data.input.fulfillment_address.line_one,
          address_2: data.input.fulfillment_address.line_two,
          city: data.input.fulfillment_address.city,
          province: data.input.fulfillment_address.state,
          postal_code: data.input.fulfillment_address.postal_code,
          country_code: data.input.fulfillment_address.country,
          phone: data.input.fulfillment_address.phone_number,
        } : undefined,
      }
    })

    updateCartWorkflow.runAsStep({
      input: updateData,
    })

    // try to update shipping method
    when(input, (input) => !!input.fulfillment_option_id)
    .then(() => {
      addShippingMethodToCartWorkflow.runAsStep({
        input: {
          cart_id: updateData.id,
          options: [{
            id: input.fulfillment_option_id!,
          }],
        },
      })
    })

    const responseData = prepareCheckoutSessionDataWorkflow.runAsStep({
      input: {
        cart_id: updateData.id,
        buyer: input.buyer,
        fulfillment_address: input.fulfillment_address,
      }
    })

    return new WorkflowResponse(responseData)
  }
)