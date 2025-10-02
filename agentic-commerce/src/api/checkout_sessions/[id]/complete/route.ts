import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { z } from "zod"
import { completeCheckoutSessionWorkflow } from "../../../../workflows/complete-checkout-session"
import { MedusaError } from "@medusajs/framework/utils"
import { refreshPaymentCollectionForCartWorkflow } from "@medusajs/medusa/core-flows"
import { prepareCheckoutSessionDataWorkflow } from "../../../../workflows/prepare-checkout-session-data"

export const PostCompleteSessionSchema = z.object({
  buyer: z.object({
    first_name: z.string(),
    email: z.string(),
    phone_number: z.string().optional(),
  }).optional(),
  payment_data: z.object({
    token: z.string(),
    provider: z.string(),
    billing_address: z.object({
      name: z.string(),
      line_one: z.string(),
      line_two: z.string().optional(),
      city: z.string(),
      state: z.string(),
      postal_code: z.string(),
      country: z.string(),
      phone_number: z.string().optional(),
    }).optional(),
  }),
})

export const POST = async (
  req: MedusaRequest<
    z.infer<typeof PostCompleteSessionSchema>
  >,
  res: MedusaResponse
) => {
  const responseHeaders = {
    "Idempotency-Key": req.headers["idempotency-key"] as string,
    "Request-Id": req.headers["request-id"] as string,
  }
  try {
    const { result } = await completeCheckoutSessionWorkflow(req.scope)
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