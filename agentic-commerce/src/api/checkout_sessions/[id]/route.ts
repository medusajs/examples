import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { updateCheckoutSessionWorkflow } from "../../../workflows/update-checkout-session"
import { z } from "zod"
import { MedusaError } from "@medusajs/framework/utils"
import { prepareCheckoutSessionDataWorkflow } from "../../../workflows/prepare-checkout-session-data"
import { refreshPaymentCollectionForCartWorkflow } from "@medusajs/medusa/core-flows"

export const PostUpdateSessionSchema = z.object({
  buyer: z.object({
    first_name: z.string(),
    email: z.string(),
    phone_number: z.string().optional(),
  }).optional(),
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number(),
  })).optional(),
  fulfillment_address: z.object({
    name: z.string(),
    line_one: z.string(),
    line_two: z.string().optional(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postal_code: z.string(),
    phone_number: z.string().optional(),
  }).optional(),
  fulfillment_option_id: z.string().optional(),
})

export const POST = async (
  req: MedusaRequest<
    z.infer<typeof PostUpdateSessionSchema>
  >,
  res: MedusaResponse
) => {
  const responseHeaders = {
    "Idempotency-Key": req.headers["idempotency-key"] as string,
    "Request-Id": req.headers["request-id"] as string,
  }
  try {
    const { result } = await updateCheckoutSessionWorkflow(req.scope)
      .run({
        input: {
          cart_id: req.params.id,
          ...req.validatedBody,
        },
        context: {
          idempotencyKey: req.headers["idempotency-key"] as string,
        }
      })

    res.set(responseHeaders).json(result)
  } catch (error) {
    const medusaError = error as MedusaError

    await refreshPaymentCollectionForCartWorkflow(req.scope).run({
      input: {
        cart_id: req.params.id,
      }
    })
    
    const { result } = await prepareCheckoutSessionDataWorkflow(req.scope)
      .run({
        input: {
          cart_id: req.params.id,
          ...req.validatedBody,
          messages: [
            {
              type: "error",
              code: medusaError.type === MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR ? 
                "payment_declined" : "invalid",
              content_type: "plain",
              content: medusaError.message,
            }
          ]
        },
      })

    res.set(responseHeaders).json(result)
  }
}

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const responseHeaders = {
    "Idempotency-Key": req.headers["idempotency-key"] as string,
    "Request-Id": req.headers["request-id"] as string,
  }
  try {
    const { result } = await prepareCheckoutSessionDataWorkflow(req.scope)
      .run({
        input: {
          cart_id: req.params.id,
        },
        context: {
          idempotencyKey: req.headers["idempotency-key"] as string,
        }
      })

    res.set(responseHeaders).status(200).json(result)
  } catch (error) {
    const medusaError = error as MedusaError
    const statusCode = medusaError.type === MedusaError.Types.NOT_FOUND ? 404 : 500
    res.set(responseHeaders).status(statusCode).json({
      type: "invalid_request",
      code: "request_not_idempotent",
      message: statusCode === 404 ? "Checkout session not found" : "Internal server error",
    })
  }
}