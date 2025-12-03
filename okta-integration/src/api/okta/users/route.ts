import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { z } from "zod"
import { createUserWorkflow } from "../../../workflows/create-user"

export const CreateUserSchema = z.object({
  email: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
})

type CreateUserBody = z.infer<typeof CreateUserSchema>

export const POST = async (
  req: AuthenticatedMedusaRequest<CreateUserBody>, 
  res: MedusaResponse
) => {
  const user = await createUserWorkflow(req.scope)
    .run({
      input: {
        email: req.validatedBody.email,
        auth_identity_id: req.auth_context!.auth_identity_id!,
        first_name: req.validatedBody.first_name,
        last_name: req.validatedBody.last_name,
      },
    })

  return res.status(201).json({ user })
}