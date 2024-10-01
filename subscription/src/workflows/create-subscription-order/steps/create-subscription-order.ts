import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { 
  CartWorkflowDTO,
  PaymentCollectionDTO,
  IOrderModuleService,
  LinkDefinition
} from "@medusajs/framework/types"
import { 
  Modules
} from "@medusajs/framework/utils"
import { createOrdersWorkflow } from "@medusajs/medusa/core-flows"
import { SubscriptionData } from "../../../modules/subscription/types"
import { SUBSCRIPTION_MODULE } from "../../../modules/subscription"

type StepInput = {
  subscription: SubscriptionData
  cart: CartWorkflowDTO
  payment_collection: PaymentCollectionDTO
}

function getOrderData (cart: CartWorkflowDTO) {
  return {
    region_id: cart.region_id,
    customer_id: cart.customer_id,
    sales_channel_id: cart.sales_channel_id,
    email: cart.email,
    currency_code: cart.currency_code,
    shipping_address: {
      ...cart.shipping_address,
      id: null
    },
    billing_address: {
      ...cart.billing_address,
      id: null
    },
    items: cart.items,
    shipping_methods: cart.shipping_methods.map((method) => ({
      name: method.name,
      amount: method.amount,
      is_tax_inclusive: method.is_tax_inclusive,
      shipping_option_id: method.shipping_option_id,
      data: method.data,
      tax_lines: method.tax_lines.map((taxLine) => ({
        description: taxLine.description,
        tax_rate_id: taxLine.tax_rate_id,
        code: taxLine.code,
        rate: taxLine.rate,
        provider_id: taxLine.provider_id
      })),
      adjustments: method.adjustments.map((adjustment) => ({
        code: adjustment.code,
        amount: adjustment.amount,
        description: adjustment.description,
        promotion_id: adjustment.promotion_id,
        provider_id: adjustment.provider_id
      }))
    })),
  }
}

const createSubscriptionOrderStep = createStep(
  "create-subscription-order",
  async ({ 
    subscription, cart, payment_collection
  }: StepInput, { container, context }) => {
    const linkDefs: LinkDefinition[] = []

    const { result: order } = await createOrdersWorkflow(container)
      .run({
        input: getOrderData(cart),
        context
      })

    linkDefs.push({
      [Modules.ORDER]: {
        order_id: order.id
      },
      [Modules.PAYMENT]: {
        payment_collection_id: payment_collection.id
      }
    },
    {
      [SUBSCRIPTION_MODULE]: {
        subscription_id: subscription.id
      },
      [Modules.ORDER]: {
        order_id: order.id
      }
    })

    return new StepResponse({
      order,
      linkDefs
    }, {
      order
    })
  },
  async ({ order }, { container }) => {
    const orderModuleService: IOrderModuleService = container.resolve(
      Modules.ORDER
    )

    await orderModuleService.cancel(order.id)
  }
)

export default createSubscriptionOrderStep