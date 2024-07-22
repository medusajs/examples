import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/medusa"
import { 
  ModuleRegistrationName,
  remoteQueryObjectFromString,
  MedusaError
} from "@medusajs/utils"

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const fileModuleService = req.scope.resolve(
    ModuleRegistrationName.FILE
  )
  const remoteQuery = req.scope.resolve("remoteQuery")

  const customerQuery = remoteQueryObjectFromString({
    entryPoint: "customer",
    fields: [
      "orders.digital_product_order.*",
    ],
    variables: {
      filters: {
        id: req.auth_context.actor_id,
      }
    }
  })

  const customerResult = await remoteQuery(customerQuery)
  const customerDigitalOrderIds = customerResult[0].orders
    .filter((order) => order.digital_product_order !== undefined)
    .map((order) => order.digital_product_order.id)

  const dpoQuery = remoteQueryObjectFromString({
    entryPoint: "digital_product_order",
    fields: [
      "products.medias.*"
    ],
    variables: {
      filters: {
        id: customerDigitalOrderIds
      }
    }
  })

  const dpoResult = await remoteQuery(dpoQuery)

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
    url: fileData.url
  })
}