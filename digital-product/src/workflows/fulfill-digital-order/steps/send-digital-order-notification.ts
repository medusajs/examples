import {
  createStep,
  StepResponse
} from "@medusajs/framework/workflows-sdk"
import { 
  INotificationModuleService,
  IFileModuleService
} from "@medusajs/framework/types"
import { MedusaError, ModuleRegistrationName, promiseAll } from "@medusajs/framework/utils"
import { DigitalProductOrder, MediaType } from "../../../modules/digital-product/types"

export type SendDigitalOrderNotificationStepInput = {
  digital_product_order: DigitalProductOrder
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

    if (!digitalProductOrder.order) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Digital product order is missing associated order."
      )
    }

    if (!digitalProductOrder.order.email) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Order is missing email."
      )
    }

    const notificationData = await promiseAll(
      digitalProductOrder.products.map(async (product) => {
        const medias: string[] = []
  
        await promiseAll(
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