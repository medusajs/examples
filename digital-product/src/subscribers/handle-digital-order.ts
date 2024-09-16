import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/medusa"
import { fulfillDigitalOrderWorkflow } from "../workflows/fulfill-digital-order"

async function digitalProductOrderCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await fulfillDigitalOrderWorkflow(container).run({
    input: {
      id: data.id
    }
  })
}

export default digitalProductOrderCreatedHandler

export const config: SubscriberConfig = {
  event: "digital_product_order.created",
}