import { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { AGENTIC_COMMERCE_MODULE } from "../../modules/agentic-commerce";

export async function validateAgenticRequest(
  req: MedusaRequest, 
  res: MedusaResponse, 
  next: MedusaNextFunction
) {
  const agenticCommerceModuleService = req.scope.resolve(AGENTIC_COMMERCE_MODULE)
  const apiKeyModuleService = req.scope.resolve("api_key")
  const signature = req.headers["signature"] as string
  const apiKey = req.headers["authorization"]?.replaceAll("Bearer ", "")

  const isTokenValid = await apiKeyModuleService.authenticate(apiKey || "")
  const isSignatureValid = !!req.body || await agenticCommerceModuleService.verifySignature({
    signature,
    payload: req.body
  })

  if (!isTokenValid || !isSignatureValid) {
    return res.status(401).json({
      message: "Unauthorized"
    })
  }

  next()
}