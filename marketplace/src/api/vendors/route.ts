import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/medusa"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"
import MarketplaceModuleService from "../../modules/marketplace/service";
import createVendorAdminWorkflow from "../../workflows/marketplace/create-vendor-admin";

const schema = z.object({
  name: z.string(),
  handle: z.string().optional(),
  logo: z.string().optional(),
  admin: z.object({
    email: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional()
  }).strict()
}).strict()

type RequestBody = {
  name: string,
  handle?: string,
  logo?: string,
  admin: {
    email: string,
    first_name?: string,
    last_name?: string
  }
}

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

  const { admin, ...vendorData } = schema.parse(req.body) as RequestBody

  const marketplaceModuleService: MarketplaceModuleService = req.scope
    .resolve("marketplaceModuleService")

  // create vendor
  let vendor = await marketplaceModuleService.createVendors([vendorData])

  // create vendor admin
  await createVendorAdminWorkflow(req.scope)
    .run({
      input: {
        admin: {
          ...admin,
          vendor_id: vendor[0].id
        },
        authIdentityId: req.auth_context.auth_identity_id,
      }
    })

  // retrieve vendor again with admins
  vendor = await marketplaceModuleService.retrieveVendor(vendor[0].id, {
    relations: ["admins"]
  })

  res.json({
    vendor,
  })
}