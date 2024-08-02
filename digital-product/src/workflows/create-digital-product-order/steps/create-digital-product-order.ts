import {
  createStep,
  StepResponse
} from "@medusajs/workflows-sdk"
import { 
  OrderLineItemDTO,
  ProductVariantDTO
} from "@medusajs/types"
import { DigitalProductData, OrderStatus } from "../../../modules/digital-product/types"
import DigitalProductModuleService from "../../../modules/digital-product/service"
import { DIGITAL_PRODUCT_MODULE } from "../../../modules/digital-product"

type StepInput = {
  items: (OrderLineItemDTO & {
    variant: ProductVariantDTO & {
      digital_product: DigitalProductData
    }
  })[]
}

const createDigitalProductOrderStep = createStep(
  "create-digital-product-order",
  async ({ items }: StepInput, { container }) => {
    const digitalProductModuleService: DigitalProductModuleService = 
      container.resolve(DIGITAL_PRODUCT_MODULE)

    const digitalProductIds = items.map((item) => item.variant.digital_product.id)

    const digitalProductOrder = await digitalProductModuleService.createDigitalProductOrders({
      status: OrderStatus.PENDING,
      products: digitalProductIds
    })

    return new StepResponse({
      digital_product_order: digitalProductOrder
    }, {
      digital_product_order: digitalProductOrder,
    })
  },
  async ({ digital_product_order }, { container }) => {
    const digitalProductModuleService: DigitalProductModuleService = 
      container.resolve(DIGITAL_PRODUCT_MODULE)

    await digitalProductModuleService.deleteDigitalProductOrders(digital_product_order.id)
  }
)

export default createDigitalProductOrderStep