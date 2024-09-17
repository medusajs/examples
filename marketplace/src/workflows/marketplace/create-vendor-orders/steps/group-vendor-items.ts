import { 
  createStep,
  StepResponse,
} from "@medusajs/workflows-sdk"
import { CartDTO, CartLineItemDTO } from "@medusajs/types"
import { ContainerRegistrationKeys } from "@medusajs/utils"

type StepInput = {
  cart: CartDTO
}

const groupVendorItemsStep = createStep(
  "group-vendor-items",
  async ({ cart }: StepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const vendorsItems: Record<string, CartLineItemDTO[]> = {}

    await Promise.all(cart.items?.map(async (item) => {
      const { data: [product] } = await query.graph({
        entity: "product",
        fields: ["vendor.*"],
        filters: {
          id: [item.product_id]
        }
      })

      const vendorId = product.vendor?.id

      if (!vendorId) {
        return
      }
      vendorsItems[vendorId] = [
        ...(vendorsItems[vendorId] || []),
        item
      ]
    }))

    return new StepResponse({
      vendorsItems
    })
  }
)

export default groupVendorItemsStep