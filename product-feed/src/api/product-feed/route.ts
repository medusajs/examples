import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import generateProductFeedWorkflow from "../../workflows/generate-product-feed"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { 
    currency_code,
    country_code,
   } = req.validatedQuery

  const { result } = await generateProductFeedWorkflow(req.scope).run({
    input: {
      currency_code: currency_code as string,
      country_code: country_code as string,
    }
  })

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8")
  res.status(200).send(result.xml)
}


