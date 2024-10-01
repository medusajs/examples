import { MedusaError } from "@medusajs/framework/utils"
import {
  WorkflowData,
  WorkflowResponse,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { 
  setAuthAppMetadataStep,
  useRemoteQueryStep
} from "@medusajs/medusa/core-flows"
import deleteVendorAdminStep from "./steps/delete-vendor-admin"

export type DeleteVendorAdminWorkflow = {
  id: string
}

export const deleteVendorAdminWorkflow = createWorkflow(
  "delete-restaurant-admin",
  (
    input: WorkflowData<DeleteVendorAdminWorkflow>
  ): WorkflowResponse<string> => {
    deleteVendorAdminStep(input)

    const authIdentities = useRemoteQueryStep({
      entry_point: "auth_identity",
      fields: ["id"],
      variables: {
        filters: {
          app_metadata: {
            vendor_id: input.id,
          },
        },
      },
    })

    const authIdentity = transform(
      { authIdentities },
      ({ authIdentities }) => {
        const authIdentity = authIdentities[0]

        if (!authIdentity) {
          throw new MedusaError(
            MedusaError.Types.NOT_FOUND,
            "Auth identity not found"
          )
        }

        return authIdentity
      }
    )

    setAuthAppMetadataStep({
      authIdentityId: authIdentity.id,
      actorType: "vendor",
      value: null,
    })

    return new WorkflowResponse(input.id)
  }
)
