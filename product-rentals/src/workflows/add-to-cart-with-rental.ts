import { 
  createWorkflow, 
  WorkflowResponse, 
  transform,
  when 
} from "@medusajs/framework/workflows-sdk"
import { 
  acquireLockStep, 
  addToCartWorkflow, 
  releaseLockStep, 
  useQueryGraphStep
} from "@medusajs/medusa/core-flows"
import { QueryContext } from "@medusajs/framework/utils"
import { 
  ValidateRentalCartItemInput, 
  validateRentalCartItemStep
} from "./steps/validate-rental-cart-item"

type AddToCartWorkflowInput = {
  cart_id: string
  variant_id: string
  quantity: number
  metadata?: Record<string, unknown>
}

export const addToCartWithRentalWorkflow = createWorkflow(
  "add-to-cart-with-rental",
  (input: AddToCartWorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: ["id", "currency_code", "region_id", "items.*"],
      filters: { id: input.cart_id },
      options: {
        throwIfKeyNotFound: true,
      },
    })

    const { data: variants } = useQueryGraphStep({
      entity: "product_variant",
      fields: [
        "id",
        "product.id",
        "product.rental_configuration.*",
        "calculated_price.*",
      ],
      filters: {
        id: input.variant_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
      context: {
        calculated_price: QueryContext({
          currency_code: carts[0].currency_code,
          region_id: carts[0].region_id,
        }),
      },
    }).config({ name: "retrieve-variant" })

    const rentalData = when({ variants }, (data) => {
      return data.variants[0].product?.rental_configuration?.status === "active"
    }).then(() => {
      return validateRentalCartItemStep({
        variant: variants[0],
        quantity: input.quantity,
        metadata: input.metadata,
        rental_configuration: variants[0].product?.rental_configuration || null,
        existing_cart_items: carts[0].items,
      } as unknown as ValidateRentalCartItemInput)
    })

    acquireLockStep({
      key: input.cart_id,
      timeout: 2,
      ttl: 10,
    })

    const itemToAdd = transform({
      input,
      rentalData,
      variants,
    }, (data) => {
      const baseItem = {
        variant_id: data.input.variant_id,
        quantity: data.input.quantity,
        metadata: data.input.metadata,
      }

      // If it's a rental product, use the calculated rental price
      if (data.rentalData?.is_rental && data.rentalData.price) {
        return [{
          ...baseItem,
          unit_price: data.rentalData.price,
        }]
      }

      // For non-rental products, don't specify unit_price (let Medusa calculate it)
      return [baseItem]
    })

    addToCartWorkflow.runAsStep({
      input: {
        cart_id: input.cart_id,
        items: itemToAdd as any,
      },
    })

    const { data: updatedCart } = useQueryGraphStep({
      entity: "cart",
      fields: ["*", "items.*"],
      filters: {
        id: input.cart_id,
      },
    }).config({ name: "refetch-cart" })

    releaseLockStep({
      key: input.cart_id,
    })

    return new WorkflowResponse({
      cart: updatedCart[0],
    })
  }
)

