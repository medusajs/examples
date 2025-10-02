import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { z } from "zod"
import { createCheckoutSessionWorkflow } from "../../workflows/create-checkout-session"
import { MedusaError } from "@medusajs/framework/utils"

export const PostCreateSessionSchema = z.object({
  items: z.array(z.object({
    id: z.string(), // variant ID
    quantity: z.number(),
  })),
  buyer: z.object({
    first_name: z.string(),
    email: z.string(),
    phone_number: z.string().optional(),
  }).optional(),
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
})

export const POST = async (
  req: MedusaRequest<
    z.infer<typeof PostCreateSessionSchema>
  >,
  res: MedusaResponse
) => {
  const logger = req.scope.resolve("logger")
  const responseHeaders = {
    "Idempotency-Key": req.headers["idempotency-key"] as string,
    "Request-Id": req.headers["request-id"] as string,
  }
  try {
    const { result } = await createCheckoutSessionWorkflow(req.scope)
      .run({
        input: req.validatedBody,
        context: {
          idempotencyKey: req.headers["idempotency-key"] as string,
        }
      })

    res.set(responseHeaders).json(result)
  } catch (error) {
    const medusaError = error as MedusaError
    logger.error(medusaError)
    res.set(responseHeaders).json({
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