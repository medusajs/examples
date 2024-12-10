import { promiseAll } from "@medusajs/framework/utils"
import { createStep } from "@medusajs/framework/workflows-sdk"
import { InferTypeOf, ProductVariantDTO } from "@medusajs/framework/types"
import RestockSubscription from "../../../modules/restock/models/restock-subscription"

type SendRestockNotificationStepInput = (InferTypeOf<typeof RestockSubscription> & {
  product_variant?: ProductVariantDTO
})[]

export const sendRestockNotificationStep = createStep(
  "send-restock-notification",
  async (input: SendRestockNotificationStepInput, { container }) => {
    const notificationModuleService = container.resolve("notification")

    const notificationData = input.map((subscription) => ({
      to: subscription.email,
      channel: "email",
      template: "variant-restock",
      data: {
        variant: subscription.product_variant
      }
    }))

    await notificationModuleService.createNotifications(notificationData)
  }
)