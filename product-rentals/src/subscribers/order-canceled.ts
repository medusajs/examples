import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateRentalWorkflow } from "../workflows/update-rental"

export default async function orderCanceledHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info(`Processing rental cancellations for order ${data.id}`)

  try {
    // Retrieve all rentals associated with the canceled order
    const { data: rentals } = await query.graph({
      entity: "rental",
      fields: ["id", "status"],
      filters: {
        order_id: data.id,
        status: {
          $ne: "cancelled",
        }
      },
    })

    if (!rentals || rentals.length === 0) {
      logger.info(`No rentals found for order ${data.id}`)
      return
    }

    logger.info(`Found ${rentals.length} rental(s) to cancel for order ${data.id}`)

    // Update each rental's status to cancelled
    let successCount = 0
    let errorCount = 0

    for (const rental of rentals) {
      try {
        await updateRentalWorkflow(container).run({
          input: {
            rental_id: (rental as any).id,
            status: "cancelled",
          },
        })
        successCount++
        logger.info(`Cancelled rental ${(rental as any).id}`)
      } catch (error) {
        errorCount++
        logger.error(
          `Failed to cancel rental ${(rental as any).id}: ${error.message}`
        )
      }
    }

    logger.info(
      `Rental cancellation complete for order ${data.id}: ${successCount} succeeded, ${errorCount} failed`
    )
  } catch (error) {
    logger.error(`Error in orderCanceledHandler: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.canceled",
}

