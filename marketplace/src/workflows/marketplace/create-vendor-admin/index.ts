import { 
  createWorkflow,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { 
  setAuthAppMetadataStep,
} from "@medusajs/medusa/core-flows"
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

const createVendorAdminWorkflow = createWorkflow(
  "create-vendor-admin",
  function (input: CreateVendorAdminWorkflowInput) {
    const vendorAdmin = createVendorAdminStep({
      admin: input.admin,
    })

    setAuthAppMetadataStep({
      authIdentityId: input.authIdentityId,
      actorType: "vendor",
      value: vendorAdmin.id,
    })

    return new WorkflowResponse(vendorAdmin)
  }
)

export default createVendorAdminWorkflow
