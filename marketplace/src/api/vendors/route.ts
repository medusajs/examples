import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"
import createVendorWorkflow, { 
  CreateVendorWorkflowInput
} from "../../workflows/marketplace/create-vendor";

export const PostVendorCreateSchema = z.object({
  name: z.string(),
  handle: z.string().optional(),
  logo: z.string().optional(),
  admin: z.object({
    email: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional()
  }).strict()
}).strict()

type RequestBody = z.infer<typeof PostVendorCreateSchema>

export const POST = async (
  req: AuthenticatedMedusaRequest<RequestBody>,
  res: MedusaResponse
) => {
  // If `actor_id` is present, the request carries 
  // authentication for an existing vendor admin
  if (req.auth_context?.actor_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Request already authenticated as a vendor."
    )
  }

  const vendorData = req.validatedBody

  // create vendor admin
  const { result } = await createVendorWorkflow(req.scope)
    .run({
      input: {
        ...vendorData,
        authIdentityId: req.auth_context.auth_identity_id,
      } as CreateVendorWorkflowInput
    })

  res.json({
    vendor: result.vendor,
  })
}