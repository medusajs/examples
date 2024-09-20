import {
  createStep,
  StepResponse
} from "@medusajs/workflows-sdk"
import { 
  INotificationModuleService,
  IFileModuleService
} from "@medusajs/types"
import { ModuleRegistrationName } from "@medusajs/utils"
import { DigitalProductOrderData, MediaType } from "../../../modules/digital-product/types"

type SendDigitalOrderNotificationStepInput = {
  digital_product_order: DigitalProductOrderData
}

export const sendDigitalOrderNotificationStep = createStep(
  "send-digital-order-notification",
  async ({ 
    digital_product_order: digitalProductOrder 
  }: SendDigitalOrderNotificationStepInput, 
  { container }) => {
    const notificationModuleService: INotificationModuleService = container
    .resolve(ModuleRegistrationName.NOTIFICATION)
    const fileModuleService: IFileModuleService = container.resolve(
      ModuleRegistrationName.FILE
    )

    const notificationData = await Promise.all(
      digitalProductOrder.products.map(async (product) => {
        const medias = []
  
        await Promise.all(
          product.medias
          .filter((media) => media.type === MediaType.MAIN)
          .map(async (media) => {
            medias.push(
              (await fileModuleService.retrieveFile(media.fileId)).url
            )
          })
        )
  
        return {
          name: product.name,
          medias
        }
      })
    )
  
    const notification = await notificationModuleService.createNotifications({
      to: digitalProductOrder.order.email,
      template: "digital-order-template",
      channel: "email",
      data: {
        products: notificationData
      }
    })

    return new StepResponse(notification)
  }
)