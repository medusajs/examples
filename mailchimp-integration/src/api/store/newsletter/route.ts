import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";

export const newsletterSignupSchema = z.object({
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
})

export async function POST(
  req: MedusaRequest<z.infer<typeof newsletterSignupSchema>>,
  res: MedusaResponse
) {
  const eventModuleService = req.scope.resolve("event_bus")

  await eventModuleService.emit({
    name: "newsletter.signup",
    data: {
      email: req.validatedBody.email,
      first_name: req.validatedBody.first_name,
      last_name: req.validatedBody.last_name,
    },
  })

  res.json({
    success: true,
  })
}
