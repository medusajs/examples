import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createUsersWorkflow, setAuthAppMetadataStep } from "@medusajs/medusa/core-flows"

type WorkflowInput = {
  email: string
  auth_identity_id: string
  first_name?: string
  last_name?: string
}

export const createUserWorkflow = createWorkflow(
  "create-user",
  (input: WorkflowInput) => {
    const users = createUsersWorkflow.runAsStep({
      input: {
        users: [
          {
            email: input.email,
            first_name: input.first_name,
            last_name: input.last_name,
          },
        ],
      },
    })

    const authUserInput = transform({ input, users }, ({ input, users }) => {
      const createdUser = users[0]

      return {
        authIdentityId: input.auth_identity_id,
        actorType: "user",
        value: createdUser.id,
      }
    })

    setAuthAppMetadataStep(authUserInput)

    return new WorkflowResponse({
      user: users[0],
    })
  }
)