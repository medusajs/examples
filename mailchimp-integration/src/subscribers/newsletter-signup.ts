import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework" 

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ email: string, first_name: string, last_name: string }>) {
  const notificationModuleService = container.resolve("notification")

  await notificationModuleService.createNotifications({
    channel: "email",
    to: data.email,
    template: "newsletter-signup",
    data: {
      first_name: data.first_name,
      last_name: data.last_name,
    }
  })
}

export const config: SubscriberConfig = {
  event: `newsletter.signup`,
}