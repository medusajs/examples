import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { updateCustomerTierOnOrderWorkflow } from "../workflows/update-customer-tier-on-order"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  try {
    await updateCustomerTierOnOrderWorkflow(container).run({
      input: {
        order_id: data.id,
      },
    })
  } catch (error) {
    logger.error(error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}

