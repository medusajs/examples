import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  throw new MedusaError(
    MedusaError.Types.UNEXPECTED_STATE,
    "This is a test error for Sentry integration."
  )
}

