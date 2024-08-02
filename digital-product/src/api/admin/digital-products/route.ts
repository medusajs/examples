import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/medusa"
import { remoteQueryObjectFromString } from "@medusajs/utils"
import { z } from "zod"
import createDigitalProductWorkflow from "../../../workflows/create-digital-product"
import { CreateDigitalProductMediaInput } from "../../../workflows/create-digital-product/steps/create-digital-product-medias"
import { createDigitalProductsSchema } from "../../validation-schemas"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { 
    fields, 
    limit = 20, 
    offset = 0
  } = req.validatedQuery || {}
  const remoteQuery = req.scope.resolve("remoteQuery")

  const query = remoteQueryObjectFromString({
    entryPoint: "digital_product",
    fields: [
      "*",
      "medias.*",
      "product_variant.*",
      ...(fields || [])
    ],
    variables: {
      skip: offset,
      take: limit
    }
  })

  const { 
    rows, 
    metadata: { count, take, skip },
  } = await remoteQuery(query)

  res.json({
    digital_products: rows,
    count,
    limit: take,
    offset: skip
  })
}

type CreateRequestBody = z.infer<
  typeof createDigitalProductsSchema
>

export const POST = async (
  req: AuthenticatedMedusaRequest<CreateRequestBody>,
  res: MedusaResponse
) => {
  const { result } = await createDigitalProductWorkflow(
    req.scope
  ).run({
    input: {
      digital_product: {
        name: req.validatedBody.name,
        medias: req.validatedBody.medias.map((media) => ({
          fileId: media.file_id,
          mimeType: media.mime_type,
          ...media
        })) as Omit<CreateDigitalProductMediaInput, "digital_product_id">[]
      },
      product: req.validatedBody.product
    }
  })

  res.json({
    digital_product: result.digital_product
  })
}