import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateRentalWorkflow } from "../workflows/update-rental"

export default async function shipmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  const logger = container.resolve("logger")
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info(`Processing rental activations for shipment ${data.id}`)

  try {
    // Retrieve the fulfillment with its items
    const { data: fulfillments } = await query.graph({
      entity: "fulfillment",
      fields: ["id", "items.*", "items.line_item_id"],
      filters: {
        id: data.id,
      },
    })

    if (!fulfillments || fulfillments.length === 0) {
      logger.warn(`Fulfillment ${data.id} not found`)
      return
    }

    const fulfillment = fulfillments[0]
    const lineItemIds = (fulfillment as any).items?.map((item: any) => item.line_item_id) || []

    if (lineItemIds.length === 0) {
      logger.info(`No items found in fulfillment ${data.id}`)
      return
    }

    logger.info(`Found ${lineItemIds.length} item(s) in fulfillment ${data.id}`)

    // Retrieve all rentals associated with these line items
    const { data: rentals } = await query.graph({
      entity: "rental",
      fields: ["id", "status", "line_item_id", "variant_id"],
      filters: {
        line_item_id: lineItemIds,
        status: "pending"
      },
    })

    if (!rentals || rentals.length === 0) {
      logger.info(`No rentals found for fulfillment ${data.id}`)
      return
    }

    logger.info(`Found ${rentals.length} rental(s) to activate for fulfillment ${data.id}`)

    // Update each rental's status to active
    let successCount = 0
    let errorCount = 0

    for (const rental of rentals) {      
      try {
        await updateRentalWorkflow(container).run({
          input: {
            rental_id: rental.id,
            status: "active",
          },
        })
        successCount++
        logger.info(`Activated rental ${rental.id} (variant: ${rental.variant_id})`)
      } catch (error) {
        errorCount++
        logger.error(
          `Failed to activate rental ${rental.id}: ${error.message}`
        )
      }
    }

    logger.info(
      `Rental activation complete for shipment ${data.id}: ${successCount} activated, ${errorCount} failed`
    )
  } catch (error) {
    logger.error(`Error in shipmentCreatedHandler: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "shipment.created",
}

