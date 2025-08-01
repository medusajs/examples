import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/medusa"
import { Modules } from "@medusajs/framework/utils"

export default async function resetPasswordTokenHandler({
  event: { data: {
    entity_id: email,
    token,
    actor_type,
  } },
  container,
}: SubscriberArgs<{ entity_id: string, token: string, actor_type: string }>) {
  const notificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )
  const config = container.resolve("configModule")

  let urlPrefix = ""

  if (actor_type === "customer") {
    urlPrefix = config.admin.storefrontUrl || "https://storefront.com"
  } else {
    const backendUrl = config.admin.backendUrl !== "/" ? config.admin.backendUrl :
      "http://localhost:9000"
    const adminPath = config.admin.path
    urlPrefix = `${backendUrl}${adminPath}`
  }

  await notificationModuleService.createNotifications({
    to: email,
    channel: "email",
    template: "password-reset",
    data: {
      // a URL to a frontend application
      reset_url: `${urlPrefix}/reset-password?token=${token}&email=${email}`,
    },
  })
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}