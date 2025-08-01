import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

export default async function inviteCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  id: string
}>) {
  const query = container.resolve("query")
  const notificationModuleService = container.resolve(
    "notification"
  )
  const config = container.resolve("configModule")

  const { data: [invite] } = await query.graph({
    entity: "invite",
    fields: [
      "email",
      "token"
    ],
    filters: {
      id: data.id,
    }
  })

  const backend_url = config.admin.backendUrl !== "/" ? config.admin.backendUrl :
    "http://localhost:9000"
  const adminPath = config.admin.path

  await notificationModuleService.createNotifications({
    to: invite.email,
    template: "user-invited",
    channel: "email",
    data: {
      invite_url: `${backend_url}${adminPath}/invite?token=${invite.token}`,
    }
  })
}

export const config: SubscriberConfig = {
  event: [
    "invite.created",
    "invite.resent"
  ],
}