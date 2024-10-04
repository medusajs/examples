import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework";
import {
  createUserWorkflow,
  CreateUserWorkflowInput,
} from "../../workflows/user/workflows/create-user";
import { createUserSchema } from "./validation-schemas";

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { auth_identity_id } = req.auth_context;

  const validatedBody = createUserSchema.parse(req.body)

  const { result } = await createUserWorkflow(req.scope).run({
    input: {
      user: validatedBody,
      auth_identity_id,
    } as CreateUserWorkflowInput,
  })

  res.status(201).json({ user: result });
};
