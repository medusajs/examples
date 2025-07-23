import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"

export default async function productCreateHandler({
  event: { data },
  container,
}: SubscriberArgs<{ 
  order_id: string;
  preorder_variant_id: string;
 }>) {
  const query = container.resolve("query")
  const notificationModuleService = container.resolve(
    "notification"
  )

  const { data: preorderVariants } = await query.graph({
    entity: "preorder_variant",
    fields: ["*"],
    filters: {
      id: data.preorder_variant_id,
    },
  })

  const { data: [order] } = await query.graph({
    entity: "order",
    fields: ["*"],
    filters: {
      id: data.order_id,
    },
  })

  await notificationModuleService.createNotifications([{
    template: "preorder_fulfilled",
    channel: "feed",
    to: order.email!,
    data: {
      preorder_variant: preorderVariants[0],
      order: order,
    }
  }])
}

export const config: SubscriberConfig = {
  event: "preorder.fulfilled",
}