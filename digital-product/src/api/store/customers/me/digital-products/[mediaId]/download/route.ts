import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse,
} from "@medusajs/medusa"
import { 
  Modules,
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/utils"

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const fileModuleService = req.scope.resolve(
    Modules.FILE
  )
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [customer] } = await query.graph({
    entity: "customer",
    fields: [
      "orders.digital_product_order.*",
    ],
    filters: {
      id: req.auth_context.actor_id,
    },
  })

  const customerDigitalOrderIds = customer.orders
    .filter((order) => order.digital_product_order !== undefined)
    .map((order) => order.digital_product_order.id)

  const { data: dpoResult } = await query.graph({
    entity: "digital_product_order",
    fields: [
      "products.medias.*",
    ],
    filters: {
      id: customerDigitalOrderIds,
    },
  })

  if (!dpoResult.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Customer didn't purchase digital product."
    )
  }

  let foundMedia = undefined

  dpoResult[0].products.some((product) => {
    return product.medias.some((media) => {
      foundMedia = media.id === req.params.mediaId ? media : undefined

      return foundMedia !== undefined
    })
  })

  if (!foundMedia) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Customer didn't purchase digital product."
    )
  }

  const fileData = await fileModuleService.retrieveFile(foundMedia.fileId)

  res.json({
    url: fileData.url,
  })
}