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

    await promiseAll(
      input.map(async (restockSubscription) => {
        await notificationModuleService.createNotifications(
          restockSubscription.subscribers.map((subscriber) => ({
            to: subscriber.email,
            channel: "email",
            template: "variant-restock",
            data: {
              variant: restockSubscription.product_variant
            }
          }))
        )
      })
    )
  }
)