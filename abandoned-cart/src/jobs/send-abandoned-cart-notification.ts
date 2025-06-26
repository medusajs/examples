import { MedusaContainer } from "@medusajs/framework/types"
import { sendAbandonedCartsWorkflow, SendAbandonedCartsWorkflowInput } from "../workflows/send-abandoned-carts"

export default async function abandonedCartJob(
  container: MedusaContainer
) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")

  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)
  // oneDayAgo.setMinutes(oneDayAgo.getMinutes() - 1) // For testing
  const limit = 100
  let offset = 0
  let totalCount = 0
  let abandonedCartsCount = 0
  do {
    const { 
      data: abandonedCarts, 
      metadata
    } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "email",
        "items.*",
        "metadata",
        "customer.*"
      ],
      filters: {
        updated_at: {
          $lt: oneDayAgo
        },
        email: {
          $ne: null
        },
        completed_at: null,
      },
      pagination: {
        skip: offset,
        take: limit
      }
    })
  
    totalCount = metadata?.count ?? 0
    const cartsWithItems = abandonedCarts.filter(cart => cart.items?.length > 0 && !cart.metadata?.abandoned_notification)
  
    try {
      await sendAbandonedCartsWorkflow(container).run({
        input: {
          carts: cartsWithItems
        } as unknown as SendAbandonedCartsWorkflowInput
      })
      abandonedCartsCount += cartsWithItems.length

    } catch (error) {
      logger.error(
        `Failed to send abandoned cart notification: ${error.message}`
      )
    }
  
    offset += limit
  } while (offset < totalCount)

  logger.info(`Sent ${abandonedCartsCount} abandoned cart notifications`)
}

export const config = {
  name: "abandoned-cart-notification",
  schedule: "0 0 * * *" // Run at midnight every day
  // schedule: "* * * * *" // Run every minute for testing
}
