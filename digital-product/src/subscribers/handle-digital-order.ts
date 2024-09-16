import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/medusa"
import { 
  INotificationModuleService,
  IFileModuleService
} from "@medusajs/types"
import { 
  Modules,
  ContainerRegistrationKeys
} from "@medusajs/utils"
import { MediaType } from "../modules/digital-product/types"

async function digitalProductOrderCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationModuleService: INotificationModuleService = container
    .resolve(Modules.NOTIFICATION)
  const fileModuleService: IFileModuleService = container.resolve(
    Modules.FILE
  )

  const { data: [digitalProductOrder] } = await query.graph({
    entryPoint: "digital_product_order",
    fields: [
      "*",
      "products.*",
      "products.medias.*",
      "order.*",
    ],
    variables: {
      filters: {
        id: data.id,
      },
    },
  })

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