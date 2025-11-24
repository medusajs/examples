import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { simpleHash, Modules } from "@medusajs/framework/utils"
import { 
  handleStrapiWebhookWorkflow, 
  WorkflowInput,
} from "../../../workflows/handle-strapi-webhook"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const body = req.body as Record<string, unknown>
  const logger = req.scope.resolve("logger")
  const cachingService = req.scope.resolve(Modules.CACHING)
  
  // Generate a hash of the webhook payload to detect duplicates
  const payloadHash = simpleHash(JSON.stringify(body))
  const cacheKey = `strapi-webhook:${payloadHash}`
  
  // Check if we've already processed this webhook
  const alreadyProcessed = await cachingService.get({ key: cacheKey })
  
  if (alreadyProcessed) {
    logger.debug(`Webhook already processed (hash: ${payloadHash}), skipping to prevent infinite loop`)
    res.status(200).send("OK - Already processed")
    return
  }
  
  if (body.event === "entry.update") {
    const entry = body.entry as Record<string, unknown>
    const entityCacheKey = `strapi-update:${body.model}:${entry.medusaId}`
    await cachingService.set({
      key: entityCacheKey,
      data: { status: "processing", timestamp: Date.now() },
      ttl: 10, 
    })
    
    await handleStrapiWebhookWorkflow(req.scope).run({
      input: {
        entry: body,
      } as WorkflowInput,
    })
    
    // Cache the hash to prevent reprocessing (TTL: 60 seconds)
    await cachingService.set({
      key: cacheKey,
      data: { status: "processed", timestamp: Date.now() },
      ttl: 60,
    })
    logger.debug(`Webhook processed and cached (hash: ${payloadHash})`)
  }

  res.status(200).send("OK")
}

