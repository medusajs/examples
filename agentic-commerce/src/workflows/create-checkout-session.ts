import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { 
  acquireLockStep,
  addShippingMethodToCartWorkflow, 
  createCartWorkflow, 
  CreateCartWorkflowInput, 
  createCustomersWorkflow, 
  listShippingOptionsForCartWithPricingWorkflow, 
  releaseLockStep, 
  useQueryGraphStep
} from "@medusajs/medusa/core-flows"
import { prepareCheckoutSessionDataWorkflow } from "./prepare-checkout-session-data"

type WorkflowInput = {
  items: {
    id: string
    quantity: number
  }[]
  buyer?: {
    first_name: string
    email: string
    phone_number?: string
  }
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
}

export const createCheckoutSessionWorkflow = createWorkflow(
  "create-checkout-session",
  (input: WorkflowInput) => {
    // validate item IDs
    const variantIds = transform({
      input
    }, (data) => {
      return data.input.items.map((item) => item.id)
    })

    // Will fail if any variant IDs are not found
    useQueryGraphStep({
      entity: "variant",
      fields: ["id"],
      filters: {
        id: variantIds
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    // Find the region ID for US
    const { data: regions } = useQueryGraphStep({
      entity: "region",
      fields: ["id"],
      filters: {
        countries: {
          iso_2: "us"
        }
      }
    }).config({ name: "find-region" })

    // get sales channel
    const { data: salesChannels } = useQueryGraphStep({
      entity: "sales_channel",
      fields: ["id"],
      // You can filter by name for a specific sales channel
      // filters: {
      //   name: "Agentic Commerce"
      // }
    }).config({ name: "find-sales-channel" })

    // check if customer already exists
    const { data: customers } = useQueryGraphStep({
      entity: "customer",
      fields: ["id"],
      filters: {
        email: input.buyer?.email,
      }
    }).config({ name: "find-customer" })

    const createdCustomers = when ({ customers }, ({ customers }) => customers.length === 0 && !!input.buyer?.email)
    .then(() => {
      return createCustomersWorkflow.runAsStep({
        input: {
          customersData: [
            {
              email: input.buyer?.email,
              first_name: input.buyer?.first_name,
              phone: input.buyer?.phone_number,
              has_account: false,
            }
          ]
        }
      })
    })

    const customerId = transform({
      customers,
      createdCustomers,
    }, (data) => {
      return data.customers.length > 0 ? data.customers[0].id : data.createdCustomers?.[0].id
    })

    const cartInput = transform({
      input,
      regions,
      salesChannels,
      customerId,
    }, (data) => {
      const splitAddressName = data.input.fulfillment_address?.name.split(" ") || []
      return {
        items: data.input.items.map((item) => ({
          variant_id: item.id,
          quantity: item.quantity
        })),
        region_id: data.regions[0]?.id,
        email: data.input.buyer?.email,
        customer_id: data.customerId,
        shipping_address: data.input.fulfillment_address ? {
          first_name: splitAddressName[0],
          last_name: splitAddressName.slice(1).join(" "),
          address_1: data.input.fulfillment_address?.line_one,
          address_2: data.input.fulfillment_address?.line_two,
          city: data.input.fulfillment_address?.city,
          province: data.input.fulfillment_address?.state,
          postal_code: data.input.fulfillment_address?.postal_code,
          country_code: data.input.fulfillment_address?.country,
        } : undefined,
        currency_code: data.regions[0]?.currency_code,
        sales_channel_id: data.salesChannels[0]?.id,
        metadata: {
          is_checkout_session: true,
        }
      } as CreateCartWorkflowInput
    })

    const createdCart = createCartWorkflow.runAsStep({
      input: cartInput
    })

    // Select the cheapest shipping option if a fulfillment address is provided
    when(input, (input) => !!input.fulfillment_address)
    .then(() => {
      // Retrieve shipping options
      const shippingOptions = listShippingOptionsForCartWithPricingWorkflow.runAsStep({
        input: {
          cart_id: createdCart.id,
        }
      })

      const shippingMethodData = transform({
        createdCart,
        shippingOptions,
      }, (data) => {
        // get the cheapest shipping option
        const cheapestShippingOption = data.shippingOptions.sort((a, b) => a.price - b.price)[0]
        return {
          cart_id: data.createdCart.id,
          options: [{
            id: cheapestShippingOption.id,
          }]
        }
      })
      acquireLockStep({
        key: createdCart.id,
        timeout: 2,
        ttl: 10,
      })
      addShippingMethodToCartWorkflow.runAsStep({
        input: shippingMethodData
      })
      releaseLockStep({
        key: createdCart.id,
      })
    })

    // Prepare response data
    const responseData = prepareCheckoutSessionDataWorkflow.runAsStep({
      input: {
        buyer: input.buyer,
        fulfillment_address: input.fulfillment_address,
        cart_id: createdCart.id,
      }
    })

    return new WorkflowResponse(responseData)
  }
)