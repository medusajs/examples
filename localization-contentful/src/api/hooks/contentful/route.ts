import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { handleContentfulHookWorkflow, HandleContentfulHookWorkflowInput } from "../../../workflows/handle-contentful-hook"
import { CONTENTFUL_MODULE } from "../../../modules/contentful"
import { CanonicalRequest } from "@contentful/node-apps-toolkit"
import { MedusaError } from "@medusajs/framework/utils"
import ContentfulModuleService from "../../../modules/contentful/service"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const contentfulModuleService: ContentfulModuleService = 
    req.scope.resolve(CONTENTFUL_MODULE)
  
  const isValid = await contentfulModuleService.verifyWebhook({
    path: req.path,
    method: req.method.toUpperCase(),
    headers: req.headers,
    body: JSON.stringify(req.body),
  } as unknown as CanonicalRequest)
  
  if (!isValid) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Invalid webhook request")
  }
          
  await handleContentfulHookWorkflow(req.scope).run({
    input: {
      entry: req.body,
    } as unknown as HandleContentfulHookWorkflowInput
  })

  res.status(200).send("OK")
}
