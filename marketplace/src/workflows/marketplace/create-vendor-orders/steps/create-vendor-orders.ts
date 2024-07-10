import { 
  createStep,
  StepResponse,
} from "@medusajs/workflows-sdk"
import { 
  CartLineItemDTO, 
  OrderDTO,
} from "@medusajs/types"
import { Modules } from "@medusajs/utils"
import { createOrdersWorkflow } from "@medusajs/core-flows"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import { VendorData } from "../../../../modules/marketplace/types"

export type VendorOrder = (OrderDTO & {
  vendor: VendorData
})

type StepInput = {
  parentOrder: OrderDTO
  vendorsItems: Record<string, CartLineItemDTO[]>
}

const createVendorOrdersStep = createStep(
  "create-vendor-orders",
  async ({ vendorsItems, parentOrder }: StepInput, { container }) => {
    const vendorIds = Object.keys(vendorsItems)
    if (vendorIds.length === 0) {
      return new StepResponse({
        orders: []
      })
    }
    const remoteLink = container.resolve("remoteLink")
    const marketplaceModuleService: MarketplaceModuleService = 
      container.resolve(MARKETPLACE_MODULE)
    const isOnlyOneVendorOrder = vendorIds.length === 1

    if (isOnlyOneVendorOrder) {
      const vendorId = vendorIds[0]
      const vendor = await marketplaceModuleService.retrieveVendor(
        vendorId
      )
      // link the parent order to the vendor instead of creating child orders
      await remoteLink.create({
        [MARKETPLACE_MODULE]: {
          vendor_id: vendorId
        },
        [Modules.ORDER]: {
          order_id: parentOrder.id
        }
      })

      return new StepResponse({
        orders: [
          {
            ...parentOrder,
            vendor
          }
        ]
      })
    }

    const createdOrders: VendorOrder[] = []

    await Promise.all(
      vendorIds.map(async (vendorId) => {
        const items = vendorsItems[vendorId]
        const vendor = await marketplaceModuleService.retrieveVendor(
          vendorId
        )
        // create an child order
        const { result: childOrder } = await createOrdersWorkflow(container)
          .run({
            input: {
              items,
              metadata: {
                parent_order_id: parentOrder.id
              },
              // use info from parent
              region_id: parentOrder.region_id,
              customer_id: parentOrder.customer_id,
              sales_channel_id: parentOrder.sales_channel_id,
              email: parentOrder.email,
              currency_code: parentOrder.currency_code,
              shipping_address_id: parentOrder.shipping_address?.id,
              billing_address_id: parentOrder.billing_address?.id,
              // A better solution would be to have shipping methods for each
              // item/vendor. This requires changes in the storefront to commodate that
              // and passing the item/vendor ID in the `data` property, for example.
              // For simplicity here we just use the same shipping method.
              shipping_methods: parentOrder.shipping_methods.map((shippingMethod) => ({
                name: shippingMethod.name,
                amount: shippingMethod.amount,
                shipping_option_id: shippingMethod.shipping_option_id,
                data: shippingMethod.data,
                tax_lines: shippingMethod.tax_lines.map((taxLine) => ({
                  code: taxLine.code,
                  rate: taxLine.rate,
                  provider_id: taxLine.provider_id,
                  tax_rate_id: taxLine.tax_rate_id,
                  description: taxLine.description
                })),
                adjustments: shippingMethod.adjustments.map((adjustment) => ({
                  code: adjustment.code,
                  amount: adjustment.amount,
                  description: adjustment.description,
                  promotion_id: adjustment.promotion_id,
                  provider_id: adjustment.provider_id
                }))
              })),
            }
          })

        await remoteLink.create({
          [MARKETPLACE_MODULE]: {
            vendor_id: vendorId
          },
          [Modules.ORDER]: {
            order_id: childOrder.id
          }
        })

        createdOrders.push({
          ...childOrder,
          vendor
        })
      })
    )

    return new StepResponse({
      orders: createdOrders
    })
  }
)

export default createVendorOrdersStep