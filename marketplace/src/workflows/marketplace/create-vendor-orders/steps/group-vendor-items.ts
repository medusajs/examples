import { 
  createStep,
  StepResponse,
} from "@medusajs/workflows-sdk"
import { CartDTO, CartLineItemDTO } from "@medusajs/types"
import { remoteQueryObjectFromString } from "@medusajs/utils"

type StepInput = {
  cart: CartDTO
}

const groupVendorItemsStep = createStep(
  "group-vendor-items",
  async ({ cart }: StepInput, { container }) => {
    const remoteQuery = container.resolve("remoteQuery")

    const vendorsItems: Record<string, CartLineItemDTO[]> = {}

    await Promise.all(cart.items?.map(async (item) => {
      const query = remoteQueryObjectFromString({
        entryPoint: "product",
        fields: ["vendor.*"],
        variables: {
          filters: {
            id: [item.product_id]
          }
        }
      })

      const result = await remoteQuery(query)

      const vendorId = result[0].vendor?.id

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