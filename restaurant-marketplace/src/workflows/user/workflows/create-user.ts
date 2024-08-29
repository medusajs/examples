import { setAuthAppMetadataStep } from "@medusajs/core-flows";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { 
  CreateDriverInput, 
  CreateRestaurantAdminInput, 
  createUserStep
} from "../steps/create-user";

export type CreateUserWorkflowInput = {
  user: (CreateRestaurantAdminInput | CreateDriverInput) & {
    actor_type: "restaurant" | "driver";
  };
  auth_identity_id: string;
};

export const createUserWorkflow = createWorkflow(
  "create-user-workflow",
  function (input: CreateUserWorkflowInput) {
    let user = createUserStep(input.user);

    const authUserInput = transform({ input, user }, (data) => ({
      authIdentityId: data.input.auth_identity_id,
      actorType: data.input.user.actor_type,
      key:
        data.input.user.actor_type === "restaurant"
          ? "restaurant_id"
          : "driver_id",
      value: user.id,
    }));

    setAuthAppMetadataStep(authUserInput);

    return new WorkflowResponse(user);
  }
);
