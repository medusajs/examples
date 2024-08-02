import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/medusa"
import { 
  INotificationModuleService,
  IFileModuleService
} from "@medusajs/types"
import { 
  ModuleRegistrationName,
  remoteQueryObjectFromString
} from "@medusajs/utils"
import { MediaType } from "../modules/digital-product/types"

async function digitalProductOrderCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const remoteQuery = container.resolve("remoteQuery")
  const notificationModuleService: INotificationModuleService = container
    .resolve(ModuleRegistrationName.NOTIFICATION)
  const fileModuleService: IFileModuleService = container.resolve(
    ModuleRegistrationName.FILE
  )

  const query = remoteQueryObjectFromString({
    entryPoint: "digital_product_order",
    fields: [
      "*",
      "products.*",
      "products.medias.*",
      "order.*"
    ],
    variables: {
      filters: {
        id: data.id
      }
    }
  })

  const digitalProductOrder = (await remoteQuery(query))[0]

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

  await notificationModuleService.createNotifications({
    to: digitalProductOrder.order.email,
    template: "digital-order-template",
    channel: "email",
    data: {
      products: notificationData
    }
  })
}

export default digitalProductOrderCreatedHandler

export const config: SubscriberConfig = {
  event: "digital_product_order.created",
}