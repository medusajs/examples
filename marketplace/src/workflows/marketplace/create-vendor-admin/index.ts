import { createWorkflow } from "@medusajs/workflows-sdk"
import { 
  setAuthAppMetadataStep,
} from "@medusajs/core-flows"
import createVendorAdminStep from "./steps/create-vendor-admin"

export type CreateVendorAdminWorkflowInput = {
  admin: {
    email: string
    first_name?: string
    last_name?: string
    vendor_id: string
  }
  authIdentityId: string
}

type CreateVendorAdminWorkflowOutput = {
  id: string
  first_name: string
  last_name: string
  email: string
}

const createVendorAdminWorkflow = createWorkflow<
  CreateVendorAdminWorkflowInput, CreateVendorAdminWorkflowOutput
>(
  "create-vendor-admin",
  function (input) {
    const vendorAdmin = createVendorAdminStep({
      admin: input.admin,
    })

    setAuthAppMetadataStep({
      authIdentityId: input.authIdentityId,
      actorType: "vendor",
      value: vendorAdmin.id,
    })

    return vendorAdmin
  }
)

export default createVendorAdminWorkflow
