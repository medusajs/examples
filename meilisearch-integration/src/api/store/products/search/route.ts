import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MEILISEARCH_MODULE } from "../../../../modules/meilisearch";
import { z } from "zod"

export const SearchSchema = z.object({
  query: z.string(),
})

type SearchRequest = z.infer<typeof SearchSchema>

export async function POST(
  req: MedusaRequest<SearchRequest>,
  res: MedusaResponse
) {
  const meilisearchModuleService = req.scope.resolve(MEILISEARCH_MODULE)

  const { query } = req.validatedBody

  const results = await meilisearchModuleService.search(
    query, 
  )

  res.json(results)
}
