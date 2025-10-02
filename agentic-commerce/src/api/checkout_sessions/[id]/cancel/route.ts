import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { cancelCheckoutSessionWorkflow } from "../../../../workflows/cancel-checkout-session"
import { MedusaError } from "@medusajs/framework/utils"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const responseHeaders = {
    "Idempotency-Key": req.headers["idempotency-key"] as string,
    "Request-Id": req.headers["request-id"] as string,
  }
  try {
    const { result } = await cancelCheckoutSessionWorkflow(req.scope)
      .run({
        input: {
          cart_id: req.params.id,
        },
        context: {
          idempotencyKey: req.headers["idempotency-key"] as string,
        }
      })
    
    res.set(responseHeaders).json(result)
  } catch (error) {
    const medusaError = error as MedusaError
    res.set(responseHeaders).status(405).json({
      messages: [
        {
          type: "error",
          code: "invalid",
          content_type: "plain",
          content: medusaError.message,
        }
      ]
    })
  }
}