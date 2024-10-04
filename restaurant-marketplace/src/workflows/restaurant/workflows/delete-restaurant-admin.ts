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
import { deleteRestaurantAdminStep } from "../steps/delete-restaurant-admin"

export type DeleteRestaurantAdminWorkflow = {
  id: string
}

export const deleteRestaurantAdminWorkflow = createWorkflow(
  "delete-restaurant-admin",
  (
    input: WorkflowData<DeleteRestaurantAdminWorkflow>
  ): WorkflowResponse<string> => {
    deleteRestaurantAdminStep(input)

    const authIdentities = useRemoteQueryStep({
      entry_point: "auth_identity",
      fields: ["id"],
      variables: {
        filters: {
          app_metadata: {
            restaurant_id: input.id,
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
      actorType: "restaurant",
      value: null,
    })

    return new WorkflowResponse(input.id)
  }
)
