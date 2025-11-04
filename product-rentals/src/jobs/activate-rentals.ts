import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateRentalWorkflow } from "../workflows/update-rental"

export default async function activateRentalsJob(container: MedusaContainer) {
  const logger = container.resolve("logger")
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // Get current date at start of day for comparison
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get tomorrow at start of day
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  try {
    // Find all pending rentals whose start date is today
    const { data: rentalsToActivate } = await query.graph({
      entity: "rental",
      fields: ["id", "rental_start_date", "status"],
      filters: {
        status: ["pending"],
        rental_start_date: {
          $gte: today,
          $lt: tomorrow,
        },
      },
    })

    if (rentalsToActivate.length === 0) {
      logger.info("No pending rentals to activate today")
      return
    }

    logger.info(`Found ${rentalsToActivate.length} rentals to activate today`)

    // Activate each rental using the workflow
    let successCount = 0
    let errorCount = 0

    for (const rental of rentalsToActivate) {
      try {
        await updateRentalWorkflow(container).run({
          input: {
            rental_id: rental.id,
            status: "active",
          },
        })
        successCount++
        logger.info(`Activated rental ${rental.id}`)
      } catch (error) {
        errorCount++
        logger.error(`Failed to activate rental ${rental.id}: ${error.message}`)
      }
    }

    logger.info(
      `Rental activation complete: ${successCount} succeeded, ${errorCount} failed`
    )
  } catch (error) {
    logger.error(`Error in rental activation job: ${error.message}`)
  }
}

export const config = {
  name: "activate-rentals",
  schedule: "0 0 * * *", // Every day at midnight
  // schedule: "*/1 * * * *", // Every minute for testing
}

