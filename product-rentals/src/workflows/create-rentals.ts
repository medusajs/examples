import { 
  createWorkflow, 
  WorkflowResponse, 
  transform
} from "@medusajs/framework/workflows-sdk"
import { 
  acquireLockStep,
  completeCartWorkflow, 
  releaseLockStep, 
  useQueryGraphStep 
} from "@medusajs/medusa/core-flows"
import { 
  ValidateRentalInput, 
  validateRentalStep
} from "./steps/validate-rental"
import { 
  CreateRentalsForOrderInput, 
  createRentalsForOrderStep
} from "./steps/create-rentals-for-order"

type CreateRentalsWorkflowInput = {
  cart_id: string
}

export const createRentalsWorkflow = createWorkflow(
  "create-rentals",
  ({ cart_id }: CreateRentalsWorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: [
        "id",
        "customer_id",
        "items.*",
        "items.variant_id",
        "items.metadata",
        "items.variant.product.rental_configuration.*",
      ],
      filters: { id: cart_id },
      options: { throwIfKeyNotFound: true },
    })

    const rentalItems = transform({ carts }, ({ carts }) => {
      const cart = carts[0]
      const rentalItemsList: Record<string, unknown>[] = []

      for (const item of cart.items || []) {
        if (!item || !item.variant) {
          continue
        }

        const rentalConfig = (item.variant as any)?.product?.rental_configuration

        // Only include items that have an active rental configuration
        if (rentalConfig && rentalConfig.status === "active") {
          const metadata = item.metadata || {}

          rentalItemsList.push({
            line_item_id: item.id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            rental_configuration: rentalConfig,
            rental_start_date: metadata.rental_start_date,
            rental_end_date: metadata.rental_end_date,
            rental_days: metadata.rental_days,
          })
        }
      }

      return rentalItemsList
    })

    const lockKey = transform({
      cart_id
    }, (data) => `cart_rentals_creation_${data.cart_id}`)

    acquireLockStep({
      key: lockKey,
    })

    validateRentalStep({ 
      rental_items: rentalItems
    } as unknown as ValidateRentalInput)

    const order = completeCartWorkflow.runAsStep({
      input: { id: cart_id },
    })

    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id", 
        "items.*", 
        "customer_id", 
        "shipping_address.*", 
        "billing_address.*",
        "items.variant.product.rental_configuration.*",
      ],
      filters: { id: order.id },
      options: { throwIfKeyNotFound: true },
    }).config({ name: "retrieve-order" })

    createRentalsForOrderStep({
      order: orders[0],
    } as unknown as CreateRentalsForOrderInput)

    releaseLockStep({
      key: lockKey,
    })

    // @ts-ignore
    return new WorkflowResponse({
      order: orders[0],
    })
  }
)

