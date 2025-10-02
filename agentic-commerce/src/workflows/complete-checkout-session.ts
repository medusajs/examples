import { 
  createWorkflow, 
  transform, 
  when, 
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { 
  completeCartWorkflow, 
  createPaymentCollectionForCartWorkflow, 
  createPaymentSessionsWorkflow, 
  refreshPaymentCollectionForCartWorkflow, 
  updateCartWorkflow, 
  useQueryGraphStep
} from "@medusajs/medusa/core-flows"
import { 
  prepareCheckoutSessionDataWorkflow, 
  PrepareCheckoutSessionDataWorkflowInput
} from "./prepare-checkout-session-data"

type WorkflowInput = {
  cart_id: string
  buyer?: {
    first_name: string
    email: string
    phone_number?: string
  }
  payment_data: {
    token: string
    provider: string
    billing_address?: {
      name: string
      line_one: string
      line_two?: string
      city: string
      state: string
      postal_code: string
      country: string
      phone_number?: string
    }
  }
}

export const completeCheckoutSessionWorkflow = createWorkflow(
  "complete-checkout-session",
  (input: WorkflowInput) => {
    // Retrieve cart details
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: ["id", "region.*", "region.payment_providers.*", "shipping_address.*"],
      filters: {
        id: input.cart_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    })

    when(input, (input) => !!input.payment_data.billing_address)
    .then(() => {
      const updateData = transform({
        input,
        carts,
      }, (data) => {
        return {
          id: data.carts[0].id,
          billing_address: {
            first_name: data.input.payment_data.billing_address!.name.split(" ")[0],
            last_name: data.input.payment_data.billing_address!.name.split(" ")[1],
            address_1: data.input.payment_data.billing_address!.line_one,
            address_2: data.input.payment_data.billing_address!.line_two,
            city: data.input.payment_data.billing_address!.city,
            province: data.input.payment_data.billing_address!.state,
            postal_code: data.input.payment_data.billing_address!.postal_code,
            country_code: data.input.payment_data.billing_address!.country,
            phone: data.input.payment_data.billing_address!.phone_number,
          }
        }
      })
      return updateCartWorkflow.runAsStep({
        input: updateData,
      })
    })

    const preparationInput = transform({
      carts,
      input,
    }, (data) => {
      return {
        cart_id: data.carts[0].id,
        buyer: data.input.buyer,
        fulfillment_address: data.carts[0].shipping_address ? {
          name: data.carts[0].shipping_address.first_name + " " + data.carts[0].shipping_address.last_name,
          line_one: data.carts[0].shipping_address.address_1 || "",
          line_two: data.carts[0].shipping_address.address_2 || "",
          city: data.carts[0].shipping_address.city || "",
          state: data.carts[0].shipping_address.province || "",
          postal_code: data.carts[0].shipping_address.postal_code || "",
          country: data.carts[0].shipping_address.country_code || "",
          phone_number: data.carts[0].shipping_address.phone || "",
        } : undefined,
      }
    })

    const paymentProviderId = transform({
      input
    }, (data) => {
      switch (data.input.payment_data.provider) {
        case "stripe":
          return "pp_stripe_stripe"
        default:
          return data.input.payment_data.provider
      }
    })

    const completeCartResponse = when({
      carts,
      paymentProviderId      
    }, (data) => {
      // @ts-ignore
      return !!data.carts[0].region?.payment_providers?.find((provider) => provider?.id === data.paymentProviderId)
    })
    .then(() => {
      const paymentCollection = createPaymentCollectionForCartWorkflow.runAsStep({
        input: {
          cart_id: carts[0].id,
        }
      })

      createPaymentSessionsWorkflow.runAsStep({
        input: {
          payment_collection_id: paymentCollection.id,
          provider_id: paymentProviderId,
          data: {
            shared_payment_token: input.payment_data.token,
          }
        }
      })

      completeCartWorkflow.runAsStep({
        input: {
          id: carts[0].id,
        }
      })

      return prepareCheckoutSessionDataWorkflow.runAsStep({
        input: preparationInput,
      })
    })

    const invalidPaymentResponse = when({
      carts,
      paymentProviderId
    }, (data) => {
      return !data.carts[0].region?.payment_providers?.find((provider) => provider?.id === data.paymentProviderId)
    })
    .then(() => {
      refreshPaymentCollectionForCartWorkflow.runAsStep({
        input: {
          cart_id: carts[0].id,
        }
      })
      const prepareDataWithMessages = transform({
        prepareData: preparationInput,
      }, (data) => {
        return {
          ...data.prepareData,
          messages: [
            {
              type: "error",
              code: "invalid",
              content_type: "plain",
              content: "Invalid payment provider",
            }
          ]
        } as PrepareCheckoutSessionDataWorkflowInput
      })
      return prepareCheckoutSessionDataWorkflow.runAsStep({
        input: prepareDataWithMessages
      }).config({ name: "prepare-checkout-session-data-with-messages" })
    })

    const responseData = transform({
      completeCartResponse,
      invalidPaymentResponse
    }, (data) => {
      return data.completeCartResponse || data.invalidPaymentResponse
    })

    return new WorkflowResponse(responseData)
  }
)