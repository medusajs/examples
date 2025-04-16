import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { QueryContext } from "@medusajs/framework/utils"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { locale, id } = req.params
  
  const query = req.scope.resolve("query")

  const { data } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "contentful_product.*",
    ],
    filters: {
      id
    },
    context: {
      contentful_product: QueryContext({
        locale,
      })
    }
  })

  res.json({
    product: data[0],
  })
  
}