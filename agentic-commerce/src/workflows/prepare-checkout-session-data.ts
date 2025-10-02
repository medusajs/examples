import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { listShippingOptionsForCartWithPricingWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows"

export type PrepareCheckoutSessionDataWorkflowInput = {
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
  cart_id: string
  messages?: {
    type: "error" | "info"
    code: "missing" | "invalid" | "out_of_stock" | "payment_declined" | "required_sign_in" | "requires_3d"
    content_type: "plain" | "markdown"
    content: string
  }[]
}

export const prepareCheckoutSessionDataWorkflow = createWorkflow(
  "prepare-checkout-session-data",
  (input: PrepareCheckoutSessionDataWorkflowInput) => {
    // Retrieve cart
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: [
        "id", 
        "items.*", 
        "shipping_address.*", 
        "shipping_methods.*",
        "region.*",
        "region.payment_providers.*", 
        "currency_code", 
        "email", 
        "phone", 
        "payment_collection.*",
        "total",
        "subtotal",
        "tax_total",
        "discount_total",
        "original_item_total",
        "shipping_total",
        "metadata",
        "order.id"
      ],
      filters: {
        id: input.cart_id,
      },
      options: {
        throwIfKeyNotFound: true
      }
    })
    
    // Retrieve shipping options
    const shippingOptions = listShippingOptionsForCartWithPricingWorkflow.runAsStep({
      input: {
        cart_id: carts[0].id,
      }
    })

    const responseData = transform({
      input,
      carts,
      shippingOptions,
    }, (data) => {
      // @ts-ignore
      const hasStripePaymentProvider = data.carts[0].region?.payment_providers?.some((provider) => provider?.id.includes("stripe"))
      const hasPaymentSession = data.carts[0].payment_collection?.payment_sessions?.some((session) => session?.status === "pending")
      return {
        id: data.carts[0].id,
        buyer: data.input.buyer,
        payment_provider: {
          provider: hasStripePaymentProvider ? "stripe" : undefined,
          supported_payment_methods: hasStripePaymentProvider ? ["card"] : undefined,
        },
        status: hasPaymentSession ? "ready_for_payment" : 
          data.carts[0].metadata?.checkout_session_canceled ? "canceled" : 
          data.carts[0].order?.id ? "completed" : "not_ready_for_payment",
        currency: data.carts[0].currency_code,
        line_items: data.carts[0].items.map((item) => ({
          id: item?.id,
          title: item?.title,
          // @ts-ignore
          base_amount: item?.original_total,
          // @ts-ignore
          discount: item?.discount_total,
          // @ts-ignore
          subtotal: item?.subtotal,
          // @ts-ignore
          tax: item?.tax_total,
          // @ts-ignore
          total: item?.total,
          item: {
            id: item?.variant_id,
            quantity: item?.quantity,
          }
        })),
        fulfillment_address: data.input.fulfillment_address,
        fulfillment_options: data.shippingOptions?.map((option) => ({
          type: "shipping",
          id: option?.id,
          title: option?.name,
          subtitle: "",
          carrier_info: option?.provider?.id,
          earliest_delivery_time: option?.type.code === "express" ? 
            new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() :  // RFC 3339 string - 24 hours
            new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // RFC 3339 string - 48 hours
          latest_delivery_time: option?.type.code === "express" ? 
            new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() :  // RFC 3339 string - 24 hours
            new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // RFC 3339 string - 48 hours
          subtotal: option?.calculated_price.calculated_amount,
          // @ts-ignore
          tax: data.carts[0].shipping_methods?.[0]?.tax_total || 0,
          // @ts-ignore
          total: data.carts[0].shipping_methods?.[0]?.total || option?.calculated_price.calculated_amount,
        })),
        fulfillment_option_id: data.carts[0].shipping_methods?.[0]?.shipping_option_id,
        totals: [
          {
            type: "item_base_amount",
            display_name: "Item Base Amount",
            // @ts-ignore
            amount: data.carts[0].original_item_total,
          },
          {
            type: "subtotal",
            display_name: "Subtotal",
            // @ts-ignore
            amount: data.carts[0].subtotal,
          },
          {
            type: "discount",
            display_name: "Discount",
            // @ts-ignore
            amount: data.carts[0].discount_total,
          },
          {
            type: "fulfillment",
            display_name: "Fulfillment",
            // @ts-ignore
            amount: data.carts[0].shipping_total,
          },
          {
            type: "tax",
            display_name: "Tax",
            // @ts-ignore
            amount: data.carts[0].tax_total,
          },
          {
            type: "total",
            display_name: "Total",
            // @ts-ignore
            amount: data.carts[0].total,
          }
        ],
        messages: data.input.messages || [],
        links: [
          {
            type: "terms_of_use",
            value: "https://www.medusa-commerce.com/terms-of-use", // TODO: replace with actual terms of use
          },
          {
            type: "privacy_policy",
            value: "https://www.medusa-commerce.com/privacy-policy", // TODO: replace with actual privacy policy
          },
          {
            type: "seller_shop_policy",
            value: "https://www.medusa-commerce.com/seller-shop-policy", // TODO: replace with actual seller shop policy
          }
        ]
      }
    })

    return new WorkflowResponse(responseData)
  }
)